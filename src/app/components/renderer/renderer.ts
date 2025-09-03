import { NODE_TYPES } from "@/utils/node-type";
import { RenderPipeline } from "./pipeline";

const THREADS_PER_WORKGROUP = 16;

export type RenderOptions = {
  width: number;
  height: number;
};

/*
 * Create all buffers needed to render the given shader graph.
 */
function createBuffers(
  device: GPUDevice,
  desc: RenderPipeline,
  opts: RenderOptions,
) {
  const buffers: GPUBuffer[] = [];

  for (let i = 0; i < desc.bufferCount; i++) {
    buffers.push(
      device.createBuffer({
        size: 16 * opts.width * opts.height,
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

  return desc.passes.map((pass, i) =>
    device.createComputePipeline({
      compute: {
        module: shaders[pass.nodeType],
        entryPoint: "main",
      },
      layout: device.createPipelineLayout({
        bindGroupLayouts: [bindGroupLayouts[i]],
      }),
    }),
  );
}

/*
 * Prepare a render pipeline for rendering by creating all the necessary
 * objects: buffers, binding groups, and compute PSOs.
 */
export function preparePipeline(
  device: GPUDevice,
  desc: RenderPipeline,
  opts: RenderOptions,
  target: GPUTexture,
) {
  const bindGroupLayouts = createBindGroupLayouts(device, desc);

  const buffers = createBuffers(device, desc, opts);
  const bindGroups = createBindGroups(device, desc, bindGroupLayouts, buffers);
  const pipelines = createComputePSOs(device, desc, bindGroupLayouts);

  const finalStageShader = device.createShaderModule({
    code: `
    @group(0) @binding(0)
    var<storage, read_write> input: array<vec4f>;

    @group(0) @binding(1)
    var tex: texture_storage_2d<rgba8unorm, write>;

    @compute @workgroup_size(16, 16)
    fn main(
      @builtin(global_invocation_id) id: vec3u
    ) {
      // Avoid accessing the buffer out of bounds
      if (id.x >= 300 || id.y >= 200) {
        return;
      }

      let color = input[id.x + id.y * 300];
      textureStore(tex, id.xy, color);
    }
    `,
  });

  const finalStageLayout = device.createBindGroupLayout({
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.COMPUTE,
        buffer: {
          type: "storage",
        },
      },
      {
        binding: 1,
        visibility: GPUShaderStage.COMPUTE,
        storageTexture: {
          format: "rgba8unorm",
        },
      },
    ],
  });

  const finalStage = {
    pipeline: device.createComputePipeline({
      compute: {
        module: finalStageShader,
        entryPoint: "main",
      },
      layout: device.createPipelineLayout({
        bindGroupLayouts: [finalStageLayout],
      }),
    }),
    bindGroup: device.createBindGroup({
      layout: finalStageLayout,
      entries: [
        {
          binding: 0,
          resource: { buffer: buffers[desc.outputBuffer] },
        },
        {
          binding: 1,
          resource: target.createView(),
        },
      ],
    }),
  };

  return { buffers, bindGroups, pipelines, finalStage };
}

/*
 * Executes a render pipeline, given the lists of PSOs and binding groups
 * for each stage.
 * Returns the buffer where the result is stored.
 */
export function render(
  device: GPUDevice,
  desc: RenderPipeline,
  opts: RenderOptions,
  buffers: GPUBuffer[],
  pipelines: GPUComputePipeline[],
  bindGroups: GPUBindGroup[],
  finalStage: { pipeline: GPUComputePipeline; bindGroup: GPUBindGroup },
) {
  const enc = device.createCommandEncoder();

  for (const input of desc.inputs) {
    // TODO copy input textures to buffers...
    console.log(input.nodeId);
  }

  /*
   * Render stages
   */
  for (const [pipeline, bindGroup] of pipelines.map(
    (p, i) => [p, bindGroups[i]] as const,
  )) {
    const pass = enc.beginComputePass();
    pass.setPipeline(pipeline);
    pass.setBindGroup(0, bindGroup);
    pass.dispatchWorkgroups(
      Math.ceil(opts.width / THREADS_PER_WORKGROUP),
      Math.ceil(opts.height / THREADS_PER_WORKGROUP),
    );
    pass.end();
  }

  /*
   * Copy output buffer to final render target
   */
  const finalPass = enc.beginComputePass();
  finalPass.setPipeline(finalStage.pipeline);
  finalPass.setBindGroup(0, finalStage.bindGroup);
  finalPass.dispatchWorkgroups(
    Math.ceil(opts.width / THREADS_PER_WORKGROUP),
    Math.ceil(opts.height / THREADS_PER_WORKGROUP),
  );
  finalPass.end();

  device.queue.submit([enc.finish()]);
}
