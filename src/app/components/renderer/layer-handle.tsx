"use client";

import cn from "classnames";
import { useLayoutEffect, useRef } from "react";

import { useConfigStore } from "@/store/config.store";
import { useProjectStore } from "@/store/project.store";
import { Rectangle } from "@/utils/point";
import { useMove } from "./handles/use-move";
import { DIR, useResize, type Direction } from "./handles/use-resize";

const directions = Object.keys(DIR) as Direction[];

export function LayerHandle() {
  const layers = useProjectStore((s) => s.layers);
  const currentLayer = useProjectStore((s) => s.currentLayer);
  const setLayerBounds = useProjectStore((s) => s.setLayerBounds);
  const layer = layers[currentLayer];

  const view = useConfigStore((s) => s.view);

  const ref = useRef<HTMLDivElement>(null);

  const setBounds = ({ x, y, w, h }: Rectangle) => setLayerBounds(x, y, w, h);
  const resizeN = useResize(ref, setBounds, "N");
  const resizeNE = useResize(ref, setBounds, "NE");
  const resizeE = useResize(ref, setBounds, "E");
  const resizeSE = useResize(ref, setBounds, "SE");
  const resizeS = useResize(ref, setBounds, "S");
  const resizeSW = useResize(ref, setBounds, "SW");
  const resizeW = useResize(ref, setBounds, "W");
  const resizeNW = useResize(ref, setBounds, "NW");
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
    ref.current?.style.setProperty("top", `${layer.position.y * scale}px`);
    ref.current?.style.setProperty("left", `${layer.position.x * scale}px`);
    ref.current?.style.setProperty("width", `${layer.size.width * scale}px`);
    ref.current?.style.setProperty("height", `${layer.size.height * scale}px`);
  }, [layer, view.zoom]);

  return (
    <div
      ref={ref}
      className="absolute rounded-xs border border-teal-400 shadow-[0_0_0_1px,inset_0_0_0_1px] shadow-black"
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
