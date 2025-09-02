import { NODE_TYPES } from "@/utils/node-type";
import { RenderPipeline } from "./pipeline";

/*
 * Create all buffers needed to render the given shader graph.
 */
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

/*
 * Create binding group layout objects for each pipeline stage.
 * Each binding group contains bindings for all inputs and outputs
 * in that stage.
 */
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

/*
 * Create the binding groups to be used when rendering.
 * Binds each pipeline stage to the actual buffers it will use.
 */
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

/*
 * Compile all shaders used in the render graph.
 * Stored in a map, this allows for shader reuse (for example,
 * if a node is used twice).
 */
function compileShaders(device: GPUDevice, desc: RenderPipeline) {
  const shaders: Record<string, GPUShaderModule> = {};

  for (const pass of desc.passes) {
    shaders[pass.nodeType] = device.createShaderModule({
      code: NODE_TYPES[pass.nodeType].shader,
    });
  }

  return shaders;
}

/*
 * Create the pipeline state objects (PSOs) for each pipeline stage.
 * Each stage is implemented as a compute pipeline that runs one shader.
 */
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

/*
 * Prepare a render pipeline for rendering by creating all the necessary
 * objects: buffers, binding groups, and compute PSOs.
 */
export function preparePipeline(device: GPUDevice, desc: RenderPipeline) {
  const bindGroupLayouts = createBindGroupLayouts(device, desc);

  const buffers = createBuffers(device, desc);
  const bindGroups = createBindGroups(device, desc, bindGroupLayouts, buffers);
  const pipelines = createComputePSOs(device, desc, bindGroupLayouts);

  return { buffers, bindGroups, pipelines };
}

/*
 * Executes a render pipeline, given the lists of PSOs and binding groups
 * for each stage.
 * Returns a buffer where the result is stored.
 */
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
