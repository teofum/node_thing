import { useRef } from "react";

type RadialHandleProps = { a?: string };

export function RadialHandle({}: RadialHandleProps) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      className="absolute rounded-[50%] border border-teal-400 shadow-[0_0_0_1px,inset_0_0_0_1px] shadow-black inset-0"
    ></div>
  );
}
