"use client";

import cn from "classnames";
import { useLayoutEffect, useRef } from "react";

import { useConfigStore } from "@/store/config.store";
import { useProjectStore } from "@/store/project.store";
import { useMoveLayer } from "./use-move-layer";
import { DIR, useResizeLayer, type Direction } from "./use-resize-layer";

const directions = Object.keys(DIR) as Direction[];

export function LayerHandle() {
  const layers = useProjectStore((s) => s.layers);
  const currentLayer = useProjectStore((s) => s.currentLayer);
  const layer = layers[currentLayer];

  const view = useConfigStore((s) => s.view);

  const ref = useRef<HTMLDivElement>(null);

  const resizeN = useResizeLayer(ref, "N");
  const resizeNE = useResizeLayer(ref, "NE");
  const resizeE = useResizeLayer(ref, "E");
  const resizeSE = useResizeLayer(ref, "SE");
  const resizeS = useResizeLayer(ref, "S");
  const resizeSW = useResizeLayer(ref, "SW");
  const resizeW = useResizeLayer(ref, "W");
  const resizeNW = useResizeLayer(ref, "NW");
  const moveHandler = useMoveLayer(ref);

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
