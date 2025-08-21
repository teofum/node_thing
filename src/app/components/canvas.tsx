"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const shaders = `
struct VertexOut {
  @builtin(position) position : vec4f,
  @location(0) color : vec4f
}

@vertex
fn vertex_main(@location(0) position: vec4f,
               @location(1) color: vec4f) -> VertexOut
{
  var output : VertexOut;
  output.position = position;
  output.color = color;
  return output;
}

@fragment
fn fragment_main(fragData: VertexOut) -> @location(0) vec4f
{
  return fragData.color;
}
`;

async function getDevice() {
  if (!navigator.gpu) throw new Error("webgpu not supported");

  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) throw new Error("couldn't get adapter");

  const device = await adapter.requestDevice();

  return device;
}

export function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [device, setDevice] = useState<GPUDevice | null>(null);

  useEffect(() => {
    async function initWebGPUDevice() {
      setDevice(await getDevice());
    }
    initWebGPUDevice();
  }, []);

  if (canvasRef.current && device) {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("webgpu");
    if (!ctx) return null;

    ctx.configure({
      device,
      format: navigator.gpu.getPreferredCanvasFormat(),
      alphaMode: "premultiplied",
    });

    const sm = device.createShaderModule({ code: shaders });

    const vertices = new Float32Array([
      0.0, 0.6, 0, 1, 1, 0, 0, 1, -0.5, -0.6, 0, 1, 0, 1, 0, 1, 0.5, -0.6, 0, 1,
      0, 0, 1, 1,
    ]);
    const vertexBuffer = device.createBuffer({
      size: vertices.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(vertexBuffer, 0, vertices, 0, vertices.length);

    const pipelineDescriptor = {
      vertex: {
        module: sm,
        entryPoint: "vertex_main",
        buffers: [
          {
            attributes: [
              {
                shaderLocation: 0, // position
                offset: 0,
                format: "float32x4",
              },
              {
                shaderLocation: 1, // color
                offset: 16,
                format: "float32x4",
              },
            ],
            arrayStride: 32,
          },
        ],
      },
      fragment: {
        module: sm,
        entryPoint: "fragment_main",
        targets: [
          {
            format: navigator.gpu.getPreferredCanvasFormat(),
          },
        ],
      },
      primitive: {
        topology: "triangle-list",
      },
      layout: "auto",
    };

    const renderPipeline = device.createRenderPipeline(
      pipelineDescriptor as any,
    );
    const commandEncoder = device.createCommandEncoder();

    const renderPassDescriptor = {
      colorAttachments: [
        {
          clearValue: { r: 0.0, g: 0.5, b: 1.0, a: 1.0 },
          loadOp: "clear",
          storeOp: "store",
          view: ctx.getCurrentTexture().createView(),
        },
      ],
    };

    const pass = commandEncoder.beginRenderPass(renderPassDescriptor as any);

    pass.setPipeline(renderPipeline);
    pass.setVertexBuffer(0, vertexBuffer);
    pass.draw(3);

    pass.end();

    device.queue.submit([commandEncoder.finish()]);
  }

  return (
    <canvas
      ref={canvasRef}
      id="main-canvas"
      className="bg-black"
      width={800}
      height={600}
    />
  );
}
