"use client";

import { useStore } from "@/store/store";
import { useEffect, useMemo, useRef, useState } from "react";
import { preparePipeline, render } from "./renderer/renderer";
import { buildRenderPipeline } from "./renderer/pipeline";

async function getDevice() {
  if (!navigator.gpu) throw new Error("webgpu not supported");

  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) throw new Error("couldn't get adapter");

  const device = await adapter.requestDevice();

  return device;
}

export function Canvas() {
  /*
   * State
   */
  const { layers } = useStore(); // TODO support multiple layers
  const [device, setDevice] = useState<GPUDevice | null>(null);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const frameRequestHandle = useRef<number | null>(null);

  /*
   * Initialize GPU device on component init
   */
  useEffect(() => {
    async function initWebGPUDevice() {
      setDevice(await getDevice());
    }
    initWebGPUDevice();
  }, []);

  /*
   * Get and configure canvas WebGPU context
   */
  const ctx = useMemo(() => {
    if (!canvas || !device) return null;

    const ctx = canvas.getContext("webgpu");
    if (!ctx) return null;

    ctx.configure({
      device,
      format: "rgba8unorm",
      usage:
        GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.STORAGE_BINDING,
      alphaMode: "premultiplied",
    });

    return ctx;
  }, [canvas, device]);

  /*
   * Rebuild pipeline when node graph state changes
   */
  const pipeline = useMemo(() => {
    if (!canvas || !ctx || !device) return null;

    // Get width and height from canvas
    const { width, height } = canvas;

    const desc = buildRenderPipeline(layers[0]);
    console.log(desc);
    if (desc.outputBuffer < 0) return null;

    return {
      desc,
      ...preparePipeline(
        device,
        desc,
        { width, height },
        ctx.getCurrentTexture(),
      ),
    };
    // Trust me, we only care about updating when edges change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvas, ctx, device, layers[0].edges]);

  /*
   * Render a frame
   */
  useEffect(() => {
    // Cancel pending renders
    if (frameRequestHandle.current)
      cancelAnimationFrame(frameRequestHandle.current);

    if (!canvas || !ctx || !device || !pipeline) return;

    const renderFrame = () => {
      const { width, height } = canvas;
      render(
        device,
        pipeline.desc,
        { width, height },
        pipeline.buffers,
        pipeline.pipelines,
        pipeline.bindGroups,
        pipeline.finalStage,
      );
    };

    frameRequestHandle.current = requestAnimationFrame(renderFrame);
  }, [canvas, ctx, device, pipeline]);

  return (
    <canvas
      ref={(ref) => setCanvas(ref)}
      id="main-canvas"
      className="bg-black"
      width={300}
      height={200}
    />
  );
}
