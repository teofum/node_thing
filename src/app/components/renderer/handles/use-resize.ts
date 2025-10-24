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
};
const defaultOptions: UseResizeOptions = {};

export function useResize(
  ref: RefObject<HTMLDivElement | null>,
  setBounds: (bounds: Rectangle) => void,
  direction: Direction,
  { centered }: UseResizeOptions = defaultOptions,
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

    // Calculate cursor delta
    const deltaX = ev.clientX - initial.x;
    const deltaY = ev.clientY - initial.y;

    // Horizontal resizing
    if (direction.includes("E")) {
      const newWidth = current.w + deltaX * (centered ? 2 : 1);
      const newX = current.x - (centered ? deltaX : 0);

      el.style.setProperty("width", `${newWidth}px`);
      el.style.setProperty("left", `${newX}px`);
    } else if (direction.includes("W")) {
      const newWidth = current.w - deltaX * (centered ? 2 : 1);
      const newX = current.x + (centered ? deltaX : 0);

      el.style.setProperty("width", `${newWidth}px`);
      el.style.setProperty("left", `${newX}px`);
    }

    // Vertical resizing
    if (direction.includes("S")) {
      const newHeight = current.h + deltaY * (centered ? 2 : 1);
      const newY = current.y - (centered ? deltaY : 0);

      el.style.setProperty("height", `${newHeight}px`);
      el.style.setProperty("top", `${newY}px`);
    } else if (direction.includes("N")) {
      const newHeight = current.h - deltaY * (centered ? 2 : 1);
      const newY = current.y + (centered ? deltaY : 0);

      el.style.setProperty("height", `${newHeight}px`);
      el.style.setProperty("top", `${newY}px`);
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
