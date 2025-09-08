"use client";

import { useStore } from "@/store/store";
import { Canvas } from "./canvas";
import { Button } from "@/ui/button";
import { LuMinus, LuPlus } from "react-icons/lu";
import { useRef } from "react";

const ZOOM_STOPS = [0.125, 0.25, 0.5, 0.75, 1, 1.5, 2, 4, 8];

export function Renderer() {
  const { canvas, view } = useStore((s) => s.properties);
  const setZoom = useStore((s) => s.setZoom);

  const viewport = useRef<HTMLDivElement | null>(null);

  const zoomIn = () => {
    setZoom(
      ZOOM_STOPS.find((stop) => stop > view.zoom) ?? ZOOM_STOPS.at(-1) ?? 1,
    );
  };

  const zoomOut = () => {
    setZoom(ZOOM_STOPS.findLast((stop) => stop < view.zoom) ?? ZOOM_STOPS[0]);
  };

  const fit = () => {
    if (!viewport.current) return;

    const vzoom =
      ((viewport.current.clientHeight - 32) / canvas.height) *
      window.devicePixelRatio;
    const hzoom =
      ((viewport.current.clientWidth - 32) / canvas.width) *
      window.devicePixelRatio;
    setZoom(Math.min(vzoom, hzoom));
  };

  return (
    <div className="rounded-2xl bg-neutral-950 z-20 border border-white/15 w-full h-full flex flex-col overflow-hidden">
      <div className="p-2 flex flex-row gap-2">
        <div className="flex flex-row">
          <Button
            icon
            variant="outline"
            className="rounded-r-none"
            onClick={zoomOut}
          >
            <LuMinus />
          </Button>
          <Button
            variant="outline"
            className="border-r-0 border-l-0 rounded-none"
            onClick={fit}
          >
            {(view.zoom * 100).toFixed(0)}%
          </Button>
          <Button
            icon
            variant="outline"
            className="rounded-l-none"
            onClick={zoomIn}
          >
            <LuPlus />
          </Button>
        </div>
      </div>
      <div
        ref={viewport}
        className="overflow-auto grow grid place-items-center p-4"
      >
        <Canvas />
      </div>
    </div>
  );
}
