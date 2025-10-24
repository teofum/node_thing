import { RefObject, useRef } from "react";

import { useConfigStore } from "@/store/config.store";
import { Rectangle, rectangleFromStyle } from "@/utils/point";
import { useDrag } from "@/utils/use-drag";
import { initialHandleState } from "./types";

export function useMove(
  ref: RefObject<HTMLDivElement | null>,
  setBounds: (bounds: Rectangle) => void,
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

    // Horizontal movement
    const newX = current.x + deltaX;
    el.style.setProperty("left", `${~~newX}px`);

    // Vertical movement
    const newY = current.y + deltaY;
    el.style.setProperty("top", `${~~newY}px`);

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
