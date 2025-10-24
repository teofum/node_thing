"uae client";

import cn from "classnames";
import { useLayoutEffect, useRef, useState } from "react";

import { useConfigStore } from "@/store/config.store";
import { Rectangle } from "@/utils/point";
import { useMove } from "./use-move";
import { DIR, useResize } from "./use-resize";
import { useRotate } from "./use-rotate";

type RadialHandleProps = { a?: string };

export function RadialHandle({}: RadialHandleProps) {
  const view = useConfigStore((s) => s.view);

  const ref = useRef<HTMLDivElement>(null);
  const [bounds, setBounds] = useState<Rectangle>({
    x: 0,
    y: 0,
    w: 100,
    h: 100,
  });

  const resizeN = useResize(ref, setBounds, "N", { centered: true });
  const resizeE = useResize(ref, setBounds, "E", { centered: true });
  const moveHandler = useMove(ref, setBounds);
  const rotateHandler = useRotate(ref, setBounds);

  const resizeHandlers = {
    N: resizeN,
    E: resizeE,
  };

  useLayoutEffect(() => {
    const scale = view.zoom / window.devicePixelRatio;
    ref.current?.style.setProperty("top", `${bounds.y * scale}px`);
    ref.current?.style.setProperty("left", `${bounds.x * scale}px`);
    ref.current?.style.setProperty("width", `${bounds.w * scale}px`);
    ref.current?.style.setProperty("height", `${bounds.h * scale}px`);
  }, [bounds, view.zoom]);

  return (
    <div
      ref={ref}
      className="absolute rounded-[50%] border border-teal-300 shadow-[0_0_0_1px,inset_0_0_0_1px] shadow-black cursor-move"
      onPointerDown={moveHandler}
    >
      {(["N", "E"] as const).map((dir) => (
        <div
          key={dir}
          className={cn(
            "absolute rounded-xs w-1.75 h-1.75 border border-teal-300 bg-black outline outline-black",
            {
              "cursor-ns-resize": dir === "N",
              "cursor-ew-resize": dir === "E",
            },
          )}
          style={{ ...DIR[dir] }}
          onPointerDown={resizeHandlers[dir]}
        />
      ))}
      <div
        className={cn(
          "absolute rounded-full w-1.75 h-1.75 border border-teal-300 bg-black outline outline-black",
          "cursor-grab",
        )}
        style={{ top: "calc(0% - 44px)", left: "calc(50% - 3px)" }}
        onPointerDown={rotateHandler}
      />
    </div>
  );
}
