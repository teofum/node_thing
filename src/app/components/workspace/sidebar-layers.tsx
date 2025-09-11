import React, { useLayoutEffect, useRef, useState } from "react";
import { RiStackLine } from "react-icons/ri";
import cn from "classnames";

import useResizeObserver from "@/utils/use-resize-observer";
import { Button, ToggleButton } from "@/ui/button";
import { LuPin } from "react-icons/lu";
import { useStore } from "@/store/store";

export function SidebarLayers() {
  const [pin, setPin] = useState(false);
  const [height, setHeight] = useState(0);
  const dummySizingDiv = useRef<HTMLDivElement | null>(null);

  const { setActiveLayer, addLayer, layersDim, currentLayer } = useStore();

  useResizeObserver(dummySizingDiv.current, () => {
    setHeight(dummySizingDiv.current?.clientHeight ?? 0);
  });
  useLayoutEffect(() => {
    setHeight(dummySizingDiv.current?.clientHeight ?? 0);
  }, []);

  const addLayerButton = () => {
    addLayer();
    setActiveLayer(layersDim);
  };

  return (
    <>
      <div
        className="absolute left-0 top-1 bottom-1 w-0"
        ref={dummySizingDiv}
      />
      <aside
        className={cn(
          "absolute right-1 top-1 z-10 w-36 flex flex-col rounded-xl group",
          "glass glass-border transition-[height] duration-300 overflow-hidden",
          { "not-hover:!h-[50px]": !pin },
        )}
        style={{ height }}
      >
        <div className="p-2 pl-4 flex flex-row gap-2 items-center min-h-12">
          <RiStackLine />
          <div className="font-semibold text-sm/4">Layers</div>
          <ToggleButton
            icon
            variant="ghost"
            className={cn("ml-auto", {
              "opacity-0 group-hover:opacity-100": !pin,
            })}
            pressed={pin}
            onPressedChange={setPin}
          >
            <LuPin />
          </ToggleButton>
        </div>
        <div className="border-t border-white/15 p-2 flex flex-col gap-3 min-h-0 overflow-auto">
          {Array.from({ length: layersDim }).map((_, idx) => (
            <Button
              key={idx}
              variant={currentLayer === idx ? "outline" : "default"}
              onClick={() => setActiveLayer(idx)}
            >
              Layer {idx}
            </Button>
          ))}

          <Button variant={"ghost"} onClick={addLayerButton}>
            Add Layer
          </Button>
        </div>
      </aside>
    </>
  );
}
