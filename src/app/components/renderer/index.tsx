"use client";

import { useEffect, useRef, useState } from "react";
import { LuCrop, LuTimer } from "react-icons/lu";

import { useAssetStore } from "@/store/asset.store";
import { useConfigStore } from "@/store/config.store";
import { useMainStore } from "@/store/main.store";
import { ToggleButton } from "@/ui/button";
import { Input } from "@/ui/input";
import { Canvas } from "./canvas";
import { LayerHandle } from "./layer-handle";
import { Timeline } from "./timeline";
import { ZoomControls } from "./zoom-controls";

export function Renderer() {
  const canvas = useMainStore((s) => s.properties.canvas);
  const setCanvasSize = useMainStore((s) => s.setCanvasSize);

  const view = useConfigStore((s) => s.view);
  const updateView = useConfigStore((s) => s.updateView);

  const [storeHydrated, setStoreHydrated] = useState(false);

  const viewport = useRef<HTMLDivElement | null>(null);

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
   * Wait for asset store hydration
   */
  useEffect(() => {
    useAssetStore.persist.onFinishHydration(() => setStoreHydrated(true));

    setStoreHydrated(useAssetStore.persist.hasHydrated());
  }, []);

  if (!storeHydrated)
    return (
      <div className="rounded-2xl bg-neutral-950 border border-white/15 w-full h-full grid place-items-center">
        <div className="font-semibold text-lg">Loading...</div>
      </div>
    );

  /*
   * Component UI
   */
  return (
    <div className="rounded-2xl bg-neutral-950 border border-white/15 w-full h-full flex flex-col overflow-hidden relative">
      <div className="p-2 flex flex-row gap-2 border-b border-white/15">
        <ZoomControls
          viewport={viewport}
          canvas={canvas}
          storeHydrated={storeHydrated}
        />

        <div className="flex flex-row items-center gap-1 ml-auto">
          <div className="font-medium text-xs">Canvas size</div>
          <Input
            variant="outline"
            size="sm"
            className="min-w-12 w-0"
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
            className="min-w-12 w-0"
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
          pressed={view.layerHandles}
          onPressedChange={(layerHandles) => updateView({ layerHandles })}
        >
          <LuCrop />
        </ToggleButton>
        <ToggleButton
          icon
          variant="outline"
          pressed={view.timeline}
          onPressedChange={(timeline) => updateView({ timeline })}
        >
          <LuTimer />
        </ToggleButton>
      </div>
      <div
        ref={viewport}
        className="overflow-auto grow grid place-items-center p-4"
      >
        <div className="relative">
          <Canvas />
          {view.layerHandles ? <LayerHandle /> : null}
        </div>
      </div>

      {view.timeline ? <Timeline /> : null}
    </div>
  );
}
