import { NODE_TYPES } from "@/utils/node-type";
import { RenderPipeline } from "./pipeline";

function createBuffers(device: GPUDevice, desc: RenderPipeline) {
  const buffers: GPUBuffer[] = [];

  for (let i = 0; i < desc.bufferCount; i++) {
    buffers.push(
      device.createBuffer({
        size: 1, // TODO
        usage: GPUBufferUsage.STORAGE,
      }),
    );
  }

  return buffers;
}

function createBindGroupLayouts(device: GPUDevice, desc: RenderPipeline) {
  return desc.passes.map((pass) =>
    device.createBindGroupLayout({
      entries: [
        ...Object.entries(pass.inputBindings),
        ...Object.entries(pass.outputBindings),
      ].map(
        (_, i): GPUBindGroupLayoutEntry => ({
          binding: i,
          visibility: GPUShaderStage.COMPUTE,
          buffer: {
            type: "storage",
          },
        }),
      ),
    }),
  );
}

function createBindGroups(
  device: GPUDevice,
  desc: RenderPipeline,
  bindGroupLayouts: GPUBindGroupLayout[],
  buffers: GPUBuffer[],
) {
  return desc.passes.map((pass, i) =>
    device.createBindGroup({
      layout: bindGroupLayouts[i],
      entries: [
        ...Object.entries(pass.inputBindings),
        ...Object.entries(pass.outputBindings),
      ].map(
        ([, bufferIdx], i): GPUBindGroupEntry => ({
          binding: i,
          resource: { buffer: buffers[bufferIdx] },
        }),
      ),
    }),
  );
}

function compileShaders(device: GPUDevice, desc: RenderPipeline) {
  const shaders: Record<string, GPUShaderModule> = {};

  for (const pass of desc.passes) {
    shaders[pass.nodeType] = device.createShaderModule({
      code: NODE_TYPES[pass.nodeType].shader,
    });
  }

  return shaders;
}

function createComputePSOs(
  device: GPUDevice,
  desc: RenderPipeline,
  bindGroupLayouts: GPUBindGroupLayout[],
) {
  const shaders = compileShaders(device, desc);

  return desc.passes.map((pass) =>
    device.createComputePipeline({
      compute: {
        module: shaders[pass.nodeType],
        entryPoint: "main",
      },
      layout: device.createPipelineLayout({
        bindGroupLayouts,
      }),
    }),
  );
}

export function preparePipeline(device: GPUDevice, desc: RenderPipeline) {
  const bindGroupLayouts = createBindGroupLayouts(device, desc);

  const buffers = createBuffers(device, desc);
  const bindGroups = createBindGroups(device, desc, bindGroupLayouts, buffers);
  const pipelines = createComputePSOs(device, desc, bindGroupLayouts);

  return { buffers, bindGroups, pipelines };
}

export function render(
  device: GPUDevice,
  pipelines: GPUComputePipeline[],
  bindGroups: GPUBindGroup[],
) {
  const enc = device.createCommandEncoder();

  for (const [pipeline, bindGroup] of pipelines.map(
    (p, i) => [p, bindGroups[i]] as const,
  )) {
    const pass = enc.beginComputePass();
    pass.setPipeline(pipeline);
    pass.setBindGroup(0, bindGroup);
    pass.dispatchWorkgroups(1, 1); // TODO amount
    pass.end();
  }

  device.queue.submit([enc.finish()]);
}
