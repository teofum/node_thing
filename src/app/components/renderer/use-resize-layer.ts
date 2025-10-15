import { RefObject } from "react";

import { useConfigStore } from "@/store/config.store";
import { useProjectStore } from "@/store/project.store";
import { clamp } from "@/utils/clamp";
import { useDrag } from "@/utils/use-drag";

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

export function useResizeLayer(
  ref: RefObject<HTMLDivElement | null>,
  direction: Direction,
) {
  const setLayerBounds = useProjectStore((s) => s.setLayerBounds);
  const view = useConfigStore((s) => s.view);

  const onDragStart = (ev: PointerEvent) => {
    const el = ref.current;
    if (!el) return;

    // Save starting window position and size to DOM data attributes temporarily
    const { top, left, width, height } = el.style;
    el.dataset.windowX = left.slice(0, -2);
    el.dataset.windowY = top.slice(0, -2);
    el.dataset.windowWidth = width.slice(0, -2);
    el.dataset.windowHeight = height.slice(0, -2);

    const parentRect = el.parentElement!.getBoundingClientRect();
    el.dataset.maxWidth = parentRect.width.toString();
    el.dataset.maxHeight = parentRect.height.toString();

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
    const minWidth = 1;
    const minHeight = 1;
    const windowX = Number(el.dataset.windowX || "0");
    const windowY = Number(el.dataset.windowY || "0");
    const maxWidth = Number(el.dataset.maxWidth || "1");
    const maxHeight = Number(el.dataset.maxHeight || "1");

    // Horizontal resizing
    if (direction.includes("E")) {
      const windowWidth = Number(el.dataset.windowWidth || "0");
      const newWidth = clamp(
        windowWidth + deltaX,
        minWidth,
        maxWidth - windowX,
      );

      el.style.setProperty("width", `${~~newWidth}px`);
    } else if (direction.includes("W")) {
      const windowWidth = Number(el.dataset.windowWidth || "0");
      const newWidth = clamp(
        windowWidth - deltaX,
        minWidth,
        windowX + windowWidth,
      );

      const maxDeltaX = windowWidth - minWidth;
      const minDeltaX = windowWidth - (maxWidth ?? Number.MAX_VALUE);
      const newX = Math.max(windowX + clamp(deltaX, minDeltaX, maxDeltaX), 0);

      el.style.setProperty("width", `${~~newWidth}px`);
      el.style.setProperty("left", `${~~newX}px`);
    }

    // Vertical resizing
    if (direction.includes("S")) {
      const windowHeight = Number(el.dataset.windowHeight || "0");
      const newHeight = clamp(
        windowHeight + deltaY,
        minHeight,
        maxHeight - windowY,
      );

      el.style.setProperty("height", `${~~newHeight}px`);
    } else if (direction.includes("N")) {
      const windowHeight = Number(el.dataset.windowHeight || "0");
      const newHeight = clamp(
        windowHeight - deltaY,
        minHeight,
        windowY + windowHeight,
      );

      const maxDeltaY = windowHeight - minHeight;
      const minDeltaY = windowHeight - (maxHeight ?? Number.MAX_VALUE);
      const newY = Math.max(windowY + clamp(deltaY, minDeltaY, maxDeltaY), 0);

      el.style.setProperty("height", `${~~newHeight}px`);
      el.style.setProperty("top", `${~~newY}px`);
    }

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
    delete el.dataset.maxWidth;
    delete el.dataset.maxHeight;
  };

  return useDrag({
    onDragStart,
    onDragMove,
    onDragEnd,
  });
}
