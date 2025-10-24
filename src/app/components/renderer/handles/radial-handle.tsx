"uae client";

import cn from "classnames";
import { useLayoutEffect, useRef, useState } from "react";

import { useConfigStore } from "@/store/config.store";
import { Rectangle } from "@/utils/point";
import { useMove } from "./use-move";
import { DIR, Direction, useResize } from "./use-resize";

const directions = Object.keys(DIR) as Direction[];

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
  const resizeNE = useResize(ref, setBounds, "NE", { centered: true });
  const resizeE = useResize(ref, setBounds, "E", { centered: true });
  const resizeSE = useResize(ref, setBounds, "SE", { centered: true });
  const resizeS = useResize(ref, setBounds, "S", { centered: true });
  const resizeSW = useResize(ref, setBounds, "SW", { centered: true });
  const resizeW = useResize(ref, setBounds, "W", { centered: true });
  const resizeNW = useResize(ref, setBounds, "NW", { centered: true });
  const moveHandler = useMove(ref, setBounds);

  const resizeHandlers = {
    N: resizeN,
    NE: resizeNE,
    E: resizeE,
    SE: resizeSE,
    S: resizeS,
    SW: resizeSW,
    W: resizeW,
    NW: resizeNW,
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
      className="absolute rounded-[50%] border border-teal-400 shadow-[0_0_0_1px,inset_0_0_0_1px] shadow-black"
      onPointerDown={moveHandler}
    >
      {directions.map((dir) => (
        <div
          key={dir}
          className={cn(
            "absolute rounded-xs w-1.75 h-1.75 border border-teal-400 bg-black outline outline-black",
            {
              "cursor-ns-resize": dir === "N" || dir === "S",
              "cursor-ew-resize": dir === "E" || dir === "W",
              "cursor-nesw-resize": dir === "NE" || dir === "SW",
              "cursor-nwse-resize": dir === "NW" || dir === "SE",
            },
          )}
          style={{ ...DIR[dir] }}
          onPointerDown={resizeHandlers[dir]}
        />
      ))}
    </div>
  );
}
