import { useMemo, useRef } from "react";

import { Layer, useStore } from "@/store/store";
import { preparePipeline } from "./renderer";
import { buildRenderPipeline, RenderPipeline } from "./pipeline";
import { compareLayers } from "./compare-layers";
import { enumerate } from "@/utils/enumerate";

export function usePipeline(
  device: GPUDevice | null,
  ctx: GPUCanvasContext | null,
) {
  const layers = useStore((s) => s.layers);
  const canvas = useStore((s) => s.properties.canvas);

  /*
   * Pipeline descriptor and layer cache
   */
  const descCache = useRef<(RenderPipeline | null)[] | null>(null);
  const layersCache = useRef<Layer[] | null>(null);

  /*
   * Rebuild render pipeline when node graph state changes
   */
  const desc = useMemo(() => {
    if (!ctx || !device) {
      descCache.current = null;
      return null;
    }

    if (!layersCache.current) layersCache.current = [];
    if (!descCache.current) descCache.current = [];

    let rebuiltAnyLayers = false;
    for (const [layer, i] of enumerate(layers)) {
      const shouldRebuildLayer =
        !layersCache.current[i] || compareLayers(layer, layersCache.current[i]);

      layersCache.current[i] = layers[i];

      if (shouldRebuildLayer) {
        console.log(`Rebuilding render graph [layer ${i}]...`);
        rebuiltAnyLayers = true;

        descCache.current[i] = buildRenderPipeline(layer);
        if (!descCache.current[i] || descCache.current[i].outputBuffer < 0)
          descCache.current[i] = null;
      }
    }

    // Rebuild the array as a different object, so react knows it's changed
    if (rebuiltAnyLayers) descCache.current = [...descCache.current];

    console.log(descCache.current);
    return descCache.current;
  }, [ctx, device, layers]);

  /*
   * Rebuild WebGPU pipeline on render pipeline change, or when the
   * canvas is resized.
   * TODO: this recompiles the shaders, which is not necessary
   */
  const pipeline = useMemo(() => {
    if (!ctx || !device || !desc) return null;

    // TODO rebuild per layer...
    console.log("Rebuilding pipeline...");
    return desc.map((layerDesc, i) =>
      layerDesc
        ? preparePipeline(device, layerDesc, {
            globalWidth: canvas.width,
            globalHeight: canvas.height,
            ...layers[i].size,
            ...layers[i].position,
          })
        : null,
    );
  }, [ctx, device, layers, desc, canvas]);

  return pipeline;
}
