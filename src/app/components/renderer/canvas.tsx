"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import cn from "classnames";

import { useMainStore } from "@/store/main.store";
import { render } from "./renderer";
import { useGPU } from "./use-gpu";
import { useWebGPUContext } from "./use-webgpu-context";
import { usePipeline } from "./use-pipeline";
import { useTextureCache } from "./use-texture-cache";
import { useUtilityStore } from "@/store/utility.store";

const SAMPLER_DESC: GPUSamplerDescriptor = {
  magFilter: "linear",
  minFilter: "linear",
};

export function Canvas() {
  /*
   * State
   */
  const { canvas: canvasProperties, view } = useMainStore((s) => s.properties);
  const canvas = useUtilityStore((s) => s.canvas);
  const setCanvas = useUtilityStore((s) => s.setCanvas);
  const nextRenderFinishedCallback = useUtilityStore(
    (s) => s.nextRenderFinishedCallback,
  );
  const onNextRenderFinished = useUtilityStore((s) => s.onNextRenderFinished);

  const frameRequestHandle = useRef<number | null>(null);

  /*
   * Handle resize
   */
  useLayoutEffect(() => {
    const scale = view.zoom / window.devicePixelRatio;
    canvas?.style.setProperty("width", `${canvas.width * scale}px`);
    canvas?.style.setProperty("height", `${canvas.height * scale}px`);
  }, [canvas, view, canvasProperties]);

  /*
   * Get GPU device and configure canvas WebGPU context
   */
  const device = useGPU();
  const ctx = useWebGPUContext(device, canvas);

  /*
   * Texture cache and sampler
   */
  const textures = useTextureCache(device);
  const sampler = useMemo(
    () => device?.createSampler(SAMPLER_DESC) ?? null,
    [device],
  );

  /*
   * Get the WebGPU pipeline
   */
  const pipeline = usePipeline(device, ctx);

  /*
   * Render a frame
   */
  useEffect(() => {
    // Cancel pending renders
    if (frameRequestHandle.current)
      cancelAnimationFrame(frameRequestHandle.current);

    if (!canvas || !ctx || !device || !pipeline || !sampler) return;

    const renderFrame = async () => {
      const target = ctx.getCurrentTexture();

      for (const layerPipeline of pipeline) {
        if (layerPipeline)
          render(device, layerPipeline, target, textures, sampler);
      }

      if (nextRenderFinishedCallback) {
        nextRenderFinishedCallback(canvas);
        onNextRenderFinished(null);
      }
    };

    frameRequestHandle.current = requestAnimationFrame(renderFrame);

    return () => {
      if (frameRequestHandle.current)
        cancelAnimationFrame(frameRequestHandle.current);
    };
  }, [
    canvas,
    ctx,
    device,
    pipeline,
    textures,
    sampler,
    nextRenderFinishedCallback,
    onNextRenderFinished,
  ]);

  return (
    <canvas
      ref={(ref) => setCanvas(ref)}
      id="main-canvas"
      className={cn("bg-pattern-squares bg-neutral-950 text-neutral-900", {
        "[image-rendering:pixelated]": view.zoom > 1,
      })}
      {...canvasProperties}
    />
  );
}
