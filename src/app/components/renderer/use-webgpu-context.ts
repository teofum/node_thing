import { useMemo } from "react";

export function useWebGPUContext(
  device: GPUDevice | null,
  canvas: HTMLCanvasElement | null,
) {
  return useMemo(() => {
    if (!canvas || !device) return null;

    const ctx = canvas.getContext("webgpu");
    if (!ctx) return null;

    ctx.configure({
      device,
      format: "rgba8unorm",
      usage:
        GPUTextureUsage.RENDER_ATTACHMENT |
        GPUTextureUsage.STORAGE_BINDING |
        GPUTextureUsage.TEXTURE_BINDING,
      alphaMode: "premultiplied",
    });

    return ctx;
  }, [canvas, device]);
}
