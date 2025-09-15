"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import cn from "classnames";

import { Layer, useStore } from "@/store/store";
import { preparePipeline, render } from "./renderer";
import { buildRenderPipeline, RenderPipeline } from "./pipeline";
import { compareLayers } from "./compare-layers";

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
  const layers = useStore((s) => s.layers);
  const { canvas: canvasProperties, view } = useStore((s) => s.properties);

  const [device, setDevice] = useState<GPUDevice | null>(null);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const frameRequestHandle = useRef<number | null>(null);

  /*
   * Handle resize
   */
  useLayoutEffect(() => {
    canvas?.style.setProperty(
      "width",
      `${(canvas.width * view.zoom) / window.devicePixelRatio}px`,
    );
    canvas?.style.setProperty(
      "height",
      `${(canvas.height * view.zoom) / window.devicePixelRatio}px`,
    );
  }, [canvas, view, canvasProperties]); // Autosize on first render

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
   * Rebuild render pipeline when node graph state changes
   */
  const lastDesc = useRef<RenderPipeline | null>(null);
  const lastLayer = useRef<Layer | null>(null);
  const desc = useMemo(() => {
    if (!canvas || !ctx || !device) {
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

    console.log(lastDesc.current);
    return lastDesc.current;
    // Trust me, we only care about updating when edges change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvas, ctx, device, layers[0]]);

  /*
   * Rebuild WebGPU pipeline on render pipeline change, or when the
   * canvas is resized.
   * TODO: this recompiles the shaders, which is not necessary
   */
  const pipeline = useMemo(() => {
    if (!canvas || !ctx || !device || !desc) return null;

    console.log("Rebuilding pipeline...");
    return preparePipeline(device, desc, canvasProperties);
  }, [canvas, ctx, device, desc, canvasProperties]);

  /*
   * Render a frame
   */
  useEffect(() => {
    // Cancel pending renders
    if (frameRequestHandle.current)
      cancelAnimationFrame(frameRequestHandle.current);

    if (!canvas || !ctx || !device || !pipeline) return;

    const renderFrame = () => {
      const target = ctx.getCurrentTexture();
      render(device, pipeline, target);
      // requestAnimationFrame(renderFrame);
    };

    frameRequestHandle.current = requestAnimationFrame(renderFrame);
  }, [canvas, ctx, device, pipeline]);

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
