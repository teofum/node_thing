import { RefObject } from "react";

import { useNodeStore } from "@/store/node.store";
import { useDrag } from "@/utils/use-drag";
import { clamp } from "@/utils/clamp";

export function useMoveLayer(ref: RefObject<HTMLDivElement | null>) {
  const setLayerBounds = useNodeStore((s) => s.setLayerBounds);
  const view = useNodeStore((s) => s.properties.view);

  const onDragStart = (ev: PointerEvent) => {
    const el = ref.current;
    if (!el) return;

    // Save starting window position and size to DOM data attributes temporarily
    const { top, left, width, height } = el.style;
    el.dataset.windowX = left.slice(0, -2);
    el.dataset.windowY = top.slice(0, -2);
    el.dataset.windowWidth = width.slice(0, -2);
    el.dataset.windowHeight = height.slice(0, -2);

    // Save pointer start position to DOM data attributes temporarily
    el.dataset.initialX = ev.clientX.toString();
    el.dataset.initialY = ev.clientY.toString();
  };

  const onDragMove = (ev: PointerEvent) => {
    const el = ref.current;
    if (!el) return;

    // Calculate cursor delta
    const initialX = Number(el.dataset.initialX || "0");
    const initialY = Number(el.dataset.initialY || "0");
    const deltaX = ev.clientX - initialX;
    const deltaY = ev.clientY - initialY;

    // Get dimension limits
    const parentRect = el.parentElement!.getBoundingClientRect();

    const windowX = Number(el.dataset.windowX || "0");
    const windowY = Number(el.dataset.windowY || "0");
    const windowWidth = Number(el.dataset.windowWidth || "0");
    const windowHeight = Number(el.dataset.windowHeight || "0");

    // Horizontal movement
    const newX = clamp(windowX + deltaX, 0, parentRect.width - windowWidth);
    el.style.setProperty("left", `${~~newX}px`);

    // Vertical movement
    const newY = clamp(windowY + deltaY, 0, parentRect.height - windowHeight);
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
    const el = ref.current;
    if (!el) return;

    // Reset offset data attributes
    delete el.dataset.initialX;
    delete el.dataset.initialY;
    delete el.dataset.windowX;
    delete el.dataset.windowY;
    delete el.dataset.windowWidth;
    delete el.dataset.windowHeight;
  };

  return useDrag({
    onDragStart,
    onDragMove,
    onDragEnd,
  });
}
