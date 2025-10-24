import { RefObject, useRef } from "react";

import { useDrag } from "@/utils/use-drag";

const initialState = {
  angle: 0,
  center: { x: 0, y: 0 },
  initial: { x: 0, y: 0 },
};

export function useRotate(
  ref: RefObject<HTMLDivElement | null>,
  setAngle: (angle: number) => void,
) {
  const state = useRef(initialState);

  const onDragStart = (ev: PointerEvent) => {
    const el = ref.current;
    if (!el) return;

    const { x, y, width: w, height: h } = el.getBoundingClientRect();
    state.current = {
      angle: Number(el.style.transform.slice(7, -4) || "0") * (Math.PI / 180),
      center: { x: x + w / 2, y: y + h / 2 },
      initial: { x: ev.clientX, y: ev.clientY },
    };
  };

  const onDragMove = (ev: PointerEvent) => {
    const el = ref.current;
    if (!el) return;

    const { initial, angle, center } = state.current;

    const theta0 = Math.atan2(initial.y - center.y, initial.x - center.x);
    const theta = Math.atan2(ev.clientY - center.y, ev.clientX - center.x);

    const newAngle = angle + theta - theta0;
    el.style.setProperty(
      "transform",
      `rotate(${newAngle * (180 / Math.PI)}deg)`,
    );

    setAngle(newAngle);
  };

  const onDragEnd = () => {
    state.current = initialState;
  };

  return useDrag({
    onDragStart,
    onDragMove,
    onDragEnd,
  });
}
