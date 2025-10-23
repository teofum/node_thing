import { RefObject, useRef } from "react";

import { useConfigStore } from "@/store/config.store";
import { useProjectStore } from "@/store/project.store";
import { clamp } from "@/utils/clamp";
import { useDrag } from "@/utils/use-drag";
import { initialHandleState } from "./handles/types";
import { rectangleFromStyle } from "@/utils/point";

export function useMoveLayer(ref: RefObject<HTMLDivElement | null>) {
  const setLayerBounds = useProjectStore((s) => s.setLayerBounds);
  const view = useConfigStore((s) => s.view);

  const state = useRef(initialHandleState);

  const onDragStart = (ev: PointerEvent) => {
    const el = ref.current;
    if (!el) return;

    const parentRect = el.parentElement!.getBoundingClientRect();
    state.current = {
      current: rectangleFromStyle(el.style),
      max: { w: parentRect.width, h: parentRect.height },
      initial: { x: ev.clientX, y: ev.clientY },
    };
  };

  const onDragMove = (ev: PointerEvent) => {
    const el = ref.current;
    if (!el) return;

    const { initial, current, max } = state.current;

    // Calculate cursor delta
    const deltaX = ev.clientX - initial.x;
    const deltaY = ev.clientY - initial.y;

    // Get dimension limits

    // Horizontal movement
    const newX = clamp(current.x + deltaX, 0, max.w - current.w);
    el.style.setProperty("left", `${~~newX}px`);

    // Vertical movement
    const newY = clamp(current.y + deltaY, 0, max.h - current.h);
    el.style.setProperty("top", `${~~newY}px`);

    const { top, left, width, height } = el.style;
    const scale = window.devicePixelRatio / view.zoom;

    const x = Math.round(Number(left.slice(0, -2)) * scale);
    const y = Math.round(Number(top.slice(0, -2)) * scale);
    const w = Math.round(Number(width.slice(0, -2)) * scale);
    const h = Math.round(Number(height.slice(0, -2)) * scale);

    setLayerBounds(x, y, w, h);
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
