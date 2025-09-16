import { useMemo, useRef } from "react";

import { Layer, useStore } from "@/store/store";
import { preparePipeline } from "./renderer";
import { buildRenderPipeline, RenderPipeline } from "./pipeline";
import { compareLayers } from "./compare-layers";

export function usePipeline(
  device: GPUDevice | null,
  ctx: GPUCanvasContext | null,
) {
  const layers = useStore((s) => s.layers);
  const canvas = useStore((s) => s.properties.canvas);

  /*
   * Rebuild render pipeline when node graph state changes
   */
  const lastDesc = useRef<RenderPipeline | null>(null);
  const lastLayer = useRef<Layer | null>(null);
  const desc = useMemo(() => {
    if (!ctx || !device) {
      lastDesc.current = null;
      return null;
    }

    const shouldRebuild =
      !lastLayer.current || compareLayers(layers[0], lastLayer.current);
    lastLayer.current = layers[0];
    if (!shouldRebuild) {
      return lastDesc.current;
    }

    console.log("Rebuilding render graph...");
    lastDesc.current = buildRenderPipeline(layers[0]);
    if (!lastDesc.current || lastDesc.current.outputBuffer < 0)
      lastDesc.current = null;

    return lastDesc.current;
  }, [ctx, device, layers]);

  /*
   * Rebuild WebGPU pipeline on render pipeline change, or when the
   * canvas is resized.
   * TODO: this recompiles the shaders, which is not necessary
   */
  const pipeline = useMemo(() => {
    if (!ctx || !device || !desc) return null;

    console.log("Rebuilding pipeline...");
    return preparePipeline(device, desc, canvas);
  }, [ctx, device, desc, canvas]);

  return pipeline;
}
