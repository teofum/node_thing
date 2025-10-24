import { RefObject, useRef } from "react";

import { useConfigStore } from "@/store/config.store";
import { Rectangle, rectangleFromStyle } from "@/utils/point";
import { useDrag } from "@/utils/use-drag";
import { initialHandleState } from "./types";

export const DIR = {
  N: { top: "calc(0% - 4.5px)", left: "calc(50% - 3.5px)" },
  NE: { top: "calc(0% - 4.5px)", left: "calc(100% - 3.5px)" },
  E: { top: "calc(50% - 3.5px)", left: "calc(100% - 3.5px)" },
  SE: { top: "calc(100% - 3.5px)", left: "calc(100% - 3.5px)" },
  S: { top: "calc(100% - 3.5px)", left: "calc(50% - 3.5px)" },
  SW: { top: "calc(100% - 3.5px)", left: "calc(0% - 4.5px)" },
  W: { top: "calc(50% - 3.5px)", left: "calc(0% - 4.5px)" },
  NW: { top: "calc(0% - 4.5px)", left: "calc(0% - 4.5px)" },
};

export type Direction = keyof typeof DIR;

type UseResizeOptions = {
  centered?: boolean;
  constrainRatio?: boolean | "shift";
  ratio?: number | "preserve";
  angle?: number;
};

export function useResize(
  ref: RefObject<HTMLDivElement | null>,
  setBounds: (bounds: Rectangle) => void,
  direction: Direction,
  {
    centered = false,
    constrainRatio = "shift",
    ratio: constrainedRatio = 1,
    angle = 0,
  }: UseResizeOptions = {},
) {
  const view = useConfigStore((s) => s.view);
  const state = useRef(initialHandleState);

  const onDragStart = (ev: PointerEvent) => {
    const el = ref.current;
    if (!el) return;

    state.current = {
      current: rectangleFromStyle(el.style),
      initial: { x: ev.clientX, y: ev.clientY },
    };
  };

  const onDragMove = (ev: PointerEvent) => {
    const el = ref.current;
    if (!el) return;

    const { initial, current } = state.current;
    const rect = { ...current };

    const square = constrainRatio === "shift" ? ev.shiftKey : constrainRatio;
    if (ev.ctrlKey) constrainedRatio = "preserve";
    const ratio =
      constrainedRatio === "preserve"
        ? current.w / current.h
        : constrainedRatio;

    // Calculate cursor delta
    const cd = { x: ev.clientX - initial.x, y: ev.clientY - initial.y };
    const deltaX = Math.cos(angle) * cd.x + Math.sin(angle) * cd.y;
    const deltaY = Math.sin(angle) * cd.x - Math.cos(angle) * cd.y;

    const minDeltaX = current.w * (centered ? 0.5 : 1);
    const minDeltaY = current.h * (centered ? 0.5 : 1);

    const resizeX = (deltaX: number, direction: "E" | "W") => {
      rect.w = current.w + deltaX * (centered ? 2 : 1);
      rect.x = current.x - (centered || direction === "W" ? deltaX : 0);

      if (square) {
        rect.y = current.y + (centered ? current.h - rect.w / ratio : 0) / 2;
        rect.h = rect.w / ratio;
      }
    };

    const resizeY = (deltaY: number, direction: "N" | "S") => {
      rect.h = current.h + deltaY * (centered ? 2 : 1);
      rect.y = current.y - (centered || direction === "N" ? deltaY : 0);

      if (square) {
        rect.x = current.x + (centered ? current.w - rect.h * ratio : 0) / 2;
        rect.w = rect.h * ratio;
      }
    };

    // Horizontal resizing
    if (direction.includes("E")) {
      resizeX(Math.max(deltaX, -minDeltaX), "E");
    } else if (direction.includes("W")) {
      resizeX(Math.max(-deltaX, -minDeltaX), "W");
    }

    // Vertical resizing
    if (direction.includes("S")) {
      resizeY(Math.max(-deltaY, -minDeltaY), "S");
    } else if (direction.includes("N")) {
      resizeY(Math.max(deltaY, -minDeltaY), "N");
    }

    const scale = window.devicePixelRatio / view.zoom;
    rect.x *= scale;
    rect.y *= scale;
    rect.w *= scale;
    rect.h *= scale;

    setBounds(rect);
  };

  const onDragEnd = () => {
    state.current = initialHandleState;
  };

  return useDrag({
    onDragStart,
    onDragMove,
    onDragEnd,
  });
}
