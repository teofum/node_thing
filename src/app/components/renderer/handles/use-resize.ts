import { RefObject, useRef } from "react";

import { useConfigStore } from "@/store/config.store";
import { Rectangle, rectangleFromStyle } from "@/utils/point";
import { useDrag } from "@/utils/use-drag";
import { initialHandleState } from "./types";

export const DIR = {
  N: { top: "calc(0% - 4px)", left: "calc(50% - 3px)" },
  NE: { top: "calc(0% - 4px)", left: "calc(100% - 3px)" },
  E: { top: "calc(50% - 3px)", left: "calc(100% - 3px)" },
  SE: { top: "calc(100% - 3px)", left: "calc(100% - 3px)" },
  S: { top: "calc(100% - 3px)", left: "calc(50% - 3px)" },
  SW: { top: "calc(100% - 3px)", left: "calc(0% - 4px)" },
  W: { top: "calc(50% - 3px)", left: "calc(0% - 4px)" },
  NW: { top: "calc(0% - 4px)", left: "calc(0% - 4px)" },
};

export type Direction = keyof typeof DIR;

type UseResizeOptions = {
  centered?: boolean;
  constrainRatio?: boolean | "shift";
  angle?: number;
};

export function useResize(
  ref: RefObject<HTMLDivElement | null>,
  setBounds: (bounds: Rectangle) => void,
  direction: Direction,
  {
    centered = false,
    constrainRatio = "shift",
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
    const square = constrainRatio === "shift" ? ev.shiftKey : constrainRatio;

    // Calculate cursor delta
    const cd = { x: ev.clientX - initial.x, y: ev.clientY - initial.y };
    const deltaX = Math.cos(angle) * cd.x + Math.sin(angle) * cd.y;
    const deltaY = Math.sin(angle) * cd.x - Math.cos(angle) * cd.y;

    const minDeltaX = current.w * (centered ? 0.5 : 1);
    const minDeltaY = current.h * (centered ? 0.5 : 1);

    const resizeX = (deltaX: number) => {
      const newWidth = current.w + deltaX * (centered ? 2 : 1);
      const newX = current.x - (centered ? deltaX : 0);

      el.style.setProperty("width", `${newWidth}px`);
      el.style.setProperty("left", `${newX}px`);

      if (square) {
        const newY = current.y + (centered ? current.h - newWidth : 0) / 2;

        el.style.setProperty("height", `${newWidth}px`);
        el.style.setProperty("top", `${newY}px`);
      }
    };

    const resizeY = (deltaY: number) => {
      const newHeight = current.h + deltaY * (centered ? 2 : 1);
      const newY = current.y - (centered ? deltaY : 0);

      el.style.setProperty("height", `${newHeight}px`);
      el.style.setProperty("top", `${newY}px`);

      if (square) {
        const newX = current.x + (centered ? current.w - newHeight : 0) / 2;

        el.style.setProperty("width", `${newHeight}px`);
        el.style.setProperty("left", `${newX}px`);
      }
    };

    // Horizontal resizing
    if (direction.includes("E")) {
      resizeX(Math.max(deltaX, -minDeltaX));
    } else if (direction.includes("W")) {
      resizeX(Math.min(deltaX, minDeltaX));
    }

    // Vertical resizing
    if (direction.includes("S")) {
      resizeY(Math.min(deltaY, minDeltaY));
    } else if (direction.includes("N")) {
      resizeY(Math.max(deltaY, -minDeltaY));
    }

    const { top, left, width, height } = el.style;
    const scale = window.devicePixelRatio / view.zoom;

    const x = Math.round(Number(left.slice(0, -2)) * scale);
    const y = Math.round(Number(top.slice(0, -2)) * scale);
    const w = Math.round(Number(width.slice(0, -2)) * scale);
    const h = Math.round(Number(height.slice(0, -2)) * scale);

    setBounds({ x, y, w, h });
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
