"use client";

import { useMainStore } from "@/store/main.store";
import { Canvas } from "./canvas";
import { Button, ToggleButton } from "@/ui/button";
import { LuCrop, LuMinus, LuPlus } from "react-icons/lu";
import { useLayoutEffect, useRef, useState } from "react";
import { Input } from "@/ui/input";
import { LayerHandle } from "./layer-handle";

const ZOOM_STOPS = [0.125, 0.25, 0.5, 0.75, 1, 1.5, 2, 4, 8];
const ZOOM_SPEED = 0.01;

export function Renderer() {
  const { canvas, view } = useMainStore((s) => s.properties);
  const setZoom = useMainStore((s) => s.setZoom);
  const setCanvasSize = useMainStore((s) => s.setCanvasSize);
  const [showLayerHandle, setShowLayerHandle] = useState(false);

  const viewport = useRef<HTMLDivElement | null>(null);

  /*
   * Zoom controls
   */
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

  useLayoutEffect(() => {
    const zoomScrollHandler = (ev: WheelEvent) => {
      if (!ev.ctrlKey) return;

      ev.preventDefault();
      ev.stopPropagation();

      const zoom = view.zoom * (1 - ev.deltaY * ZOOM_SPEED);
      setZoom(Math.max(ZOOM_STOPS[1], Math.min(ZOOM_STOPS.at(-1) ?? 1, zoom)));
    };

    const viewportEl = viewport.current;
    viewportEl?.addEventListener("wheel", zoomScrollHandler, {
      passive: false,
    });

    return () => {
      viewportEl?.removeEventListener("wheel", zoomScrollHandler);
    };
  }, [setZoom, view.zoom]);

  /*
   * Canvas size
   */
  const updateWidth = (value: string) => {
    const width = Number(value);
    if (width > 0 && isFinite(width) && width !== canvas.width) {
      setCanvasSize(width, canvas.height);
    }
  };

  const updateHeight = (value: string) => {
    const height = Number(value);
    if (height > 0 && isFinite(height) && height !== canvas.height) {
      setCanvasSize(canvas.width, height);
    }
  };

  /*
   * Component UI
   */
  return (
    <div className="rounded-2xl bg-neutral-950 border border-white/15 w-full h-full flex flex-col overflow-hidden">
      <div className="p-2 flex flex-row gap-2 border-b border-white/15">
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
            size="sm"
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

        <div className="flex flex-row items-center gap-1 ml-auto">
          <div className="font-medium text-sm">Canvas size</div>
          <Input
            variant="outline"
            size="sm"
            className="min-w-20 w-0"
            defaultValue={canvas.width}
            onBlur={(ev) => updateWidth(ev.target.value)}
            onKeyDown={(ev) => {
              if (ev.key === "Enter") updateWidth(ev.currentTarget.value);
            }}
          />
          ×
          <Input
            size="sm"
            variant="outline"
            className="min-w-20 w-0"
            defaultValue={canvas.height}
            onBlur={(ev) => updateHeight(ev.target.value)}
            onKeyDown={(ev) => {
              if (ev.key === "Enter") updateHeight(ev.currentTarget.value);
            }}
          />
        </div>

        <ToggleButton
          icon
          variant="outline"
          pressed={showLayerHandle}
          onPressedChange={setShowLayerHandle}
        >
          <LuCrop />
        </ToggleButton>
      </div>
      <div
        ref={viewport}
        className="overflow-auto grow grid place-items-center p-4"
      >
        <div className="relative">
          <Canvas />
          {showLayerHandle ? <LayerHandle /> : null}
        </div>
      </div>
    </div>
  );
}
