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
  const animation = useMainStore((s) => s.properties.animation);
  const updateAnimationTimer = useMainStore((s) => s.updateAnimationTimer);

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
  const animationState = useRef(animation.state);
  useEffect(() => {
    animationState.current = animation.state;
  }, [animation.state]);

  const animationSpeed = useRef(animation.animationSpeed);
  useEffect(() => {
    animationSpeed.current = animation.animationSpeed;
  }, [animation.animationSpeed]);

  const framerateLimit = useRef(animation.framerateLimit);
  useEffect(() => {
    framerateLimit.current = animation.framerateLimit;
  }, [animation.framerateLimit]);

  const frameIndex = useRef(0);
  const elapsedTime = useRef(0);
  useEffect(() => {
    frameIndex.current = animation.frameIndex;
    elapsedTime.current = animation.time;
  }, [animation.frameIndex, animation.time]);

  const lastFrameTime = useRef(performance.now());
  const lastFrameError = useRef(0);
  useEffect(() => {
    const cancel = () => {
      if (frameRequestHandle.current) {
        console.log("cancel", frameRequestHandle.current);
        cancelAnimationFrame(frameRequestHandle.current);
      }
    };

    const frame = () => {
      frameRequestHandle.current = requestAnimationFrame(renderFrame);
      console.log("frame", frameRequestHandle.current);
    };

    cancel();

    if (!canvas || !ctx || !device || !pipeline || !sampler) return;

    const renderFrame = async () => {
      cancel();

      const now = performance.now();
      const deltaTime = now - lastFrameTime.current;
      const minFrametime = 1000 / framerateLimit.current;
      if (
        animationState.current === "stopped" ||
        deltaTime + lastFrameError.current > minFrametime
      ) {
        const target = ctx.getCurrentTexture();
        for (const layerPipeline of pipeline) {
          if (layerPipeline)
            render(
              device,
              layerPipeline,
              target,
              textures,
              sampler,
              frameIndex.current,
              elapsedTime.current,
            );
        }

        if (nextRenderFinishedCallback) {
          nextRenderFinishedCallback(canvas);
          onNextRenderFinished(null);
        }

        await device.queue.onSubmittedWorkDone();

        if (animationState.current === "running") {
          updateAnimationTimer(deltaTime * animationSpeed.current);
          lastFrameTime.current = now;
          lastFrameError.current = deltaTime - minFrametime;
        }
      }

      if (animationState.current === "running") frame();
    };

    lastFrameTime.current = performance.now();
    cancel();
    frame();

    return () => {
      cancel();
    };
  }, [
    canvas,
    ctx,
    device,
    pipeline,
    textures,
    sampler,
    animation.state,
    nextRenderFinishedCallback,
    onNextRenderFinished,
    updateAnimationTimer,
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
