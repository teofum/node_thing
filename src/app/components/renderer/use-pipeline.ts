import { useMemo, useRef } from "react";

import { Layer } from "@/store/project.types";
import { useProjectStore } from "@/store/project.store";
import { PreparedPipeline, preparePipeline } from "./implementation/renderer";
import { RenderPipeline } from "./pipeline";
import { compareLayerDims, compareLayers } from "./compare-layers";
import { enumerate } from "@/utils/enumerate";
import { useNodeTypes } from "@/utils/use-node-types";

function compareSize(
  a: { width: number; height: number },
  b: { width: number; height: number },
) {
  return a.width !== b.width || a.height !== b.height;
}

export function usePipeline(
  device: GPUDevice | null,
  ctx: GPUCanvasContext | null,
) {
  const layers = useProjectStore((s) => s.layers);
  const canvas = useProjectStore((s) => s.properties.canvas);
  const nodeTypes = useNodeTypes();

  /*
   * Pipeline descriptor and layer cache
   */
  const descCache = useRef<(RenderPipeline | null)[] | null>(null);
  const pipelineCache = useRef<(PreparedPipeline | null)[] | null>(null);
  const layersCache = useRef<Layer[] | null>(null);
  const canvasDimsCache = useRef<typeof canvas | null>(null);
  const nodeTypesCache = useRef<typeof nodeTypes | null>(null);

  /*
   * Rebuild render pipeline when node graph state changes
   */
  const pipeline = useMemo(() => {
    if (!ctx || !device) {
      descCache.current = null;
      pipelineCache.current = null;
      layersCache.current = null;
      return null;
    }

    if (!descCache.current) descCache.current = [];
    if (!pipelineCache.current) pipelineCache.current = [];
    if (!layersCache.current) layersCache.current = [];

    layersCache.current = layersCache.current.slice(0, layers.length);
    descCache.current = descCache.current.slice(0, layers.length);
    pipelineCache.current = pipelineCache.current.slice(0, layers.length);

    /*
     * Check what needs rebuilding
     */
    const needsRebuild = layers.map((layer, i) => {
      const cachedLayers = layersCache.current!;

      // Pipeline descriptor must me rebuilt from node graph if...
      const desc =
        !cachedLayers[i] || //                              layer is not cached, or
        compareLayers(layer, cachedLayers[i]) || //         layer has changed, or
        nodeTypes != nodeTypesCache.current; //             node types have changed

      // GPU pipeline object must be rebuilt from descriptor if...
      const pipeline =
        desc || //                                          descriptor has changed, or
        !canvasDimsCache.current || //                      canvas size is not cached, or
        compareLayerDims(layer, cachedLayers[i]) || //      layer size has changed, or
        compareSize(canvasDimsCache.current, canvas); //    canvas size has changed

      cachedLayers[i] = layers[i];

      return { desc, pipeline };
    });

    canvasDimsCache.current = canvas;
    nodeTypesCache.current = nodeTypes;

    /*
     * Rebuild whatever needs to be rebuilt
     */
    for (const [layer, i] of enumerate(layers)) {
      // Rebuild layer pipeline descriptor
      if (needsRebuild[i].desc) {
        console.log(`Rebuilding render graph [layer ${i}]...`);

        descCache.current[i] = RenderPipeline.tryCreate(layer, nodeTypes);
        if (!descCache.current[i] || descCache.current[i].outputBuffer < 0)
          descCache.current[i] = null;
      }

      // Rebuild layer pipeline objects
      if (needsRebuild[i].pipeline) {
        if (descCache.current[i]) {
          console.log(`Rebuilding pipeline [layer ${i}]...`);

          pipelineCache.current[i] = preparePipeline(
            device,
            descCache.current[i],
            {
              globalWidth: canvas.width,
              globalHeight: canvas.height,
              ...layers[i].size,
              ...layers[i].position,
            },
            nodeTypes,
          );
        } else {
          pipelineCache.current[i] = null;
        }
      }
    }

    /*
     * Rebuild pipeline cache array as needed so react detects changes
     */
    if (needsRebuild.some((nr) => nr.pipeline)) {
      pipelineCache.current = [...pipelineCache.current];
    }

    return pipelineCache.current;
  }, [ctx, device, layers, canvas, nodeTypes]);

  return pipeline;
}
