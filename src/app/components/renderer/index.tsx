"use client";

import { useEffect, useRef, useState } from "react";
import { LuCrop, LuSettings, LuTimer } from "react-icons/lu";

import { useAssetStore } from "@/store/asset.store";
import { DisplayOption, useConfigStore } from "@/store/config.store";
import { useProjectStore } from "@/store/project.store";
import { Button, ToggleButton } from "@/ui/button";
import { Input } from "@/ui/input";
import { Canvas } from "./canvas";
import { LayerHandle } from "./handles/layer-handle";
import { Timeline } from "./timeline";
import { ZoomControls } from "./zoom-controls";
import { RadialHandle } from "./handles/radial-handle";
import { Popover } from "@/ui/popover";
import { Select, SelectItem } from "@/ui/select";
import { isShader } from "@/store/project.types";

export function Renderer() {
  const canvas = useProjectStore((s) => s.properties.canvas);
  const setCanvasSize = useProjectStore((s) => s.setCanvasSize);
  const { nodes, edges } = useProjectStore((s) => s.layers[s.currentLayer]);

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

  const selectedNodes = nodes.filter((n) => n.selected);
  const selectedEdges = edges.filter((e) => e.selected);

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

        <div className="mr-auto min-w-36 flex flex-row">
          <Select
            variant="outline"
            className="py-1.75"
            value={view.display}
            onValueChange={(val) =>
              updateView({ display: val as DisplayOption })
            }
          >
            <SelectItem value="final-render" className="py-1.75">
              Final render
            </SelectItem>
            <SelectItem value="layer-output" className="py-1.75">
              Layer output
            </SelectItem>
            <SelectItem value="selection" className="py-1.75">
              Selection
            </SelectItem>
          </Select>
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
        <Popover
          trigger={
            <Button icon variant="outline">
              <LuSettings />
            </Button>
          }
          className="p-3"
          align="end"
          sideOffset={4}
        >
          <div className="flex flex-row items-center gap-1">
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
        </Popover>
      </div>
      <div
        ref={viewport}
        className="overflow-auto grow grid place-items-center p-4 relative"
      >
        <div className="relative">
          <Canvas />
          {view.layerHandles ? <LayerHandle /> : null}
          {selectedNodes
            .filter(isShader)
            .filter((n) => n.data.type === "radialGradient")
            .map((n) => (
              <RadialHandle key={n.id} nodeId={n.id} node={n.data} />
            ))}
        </div>

        {view.display === "selection" && selectedEdges.length !== 1 ? (
          <div className="absolute inset-0 bg-neutral-950 grid place-items-center">
            Select a single edge to preview
          </div>
        ) : null}
      </div>

      {view.timeline ? <Timeline /> : null}
    </div>
  );
}
