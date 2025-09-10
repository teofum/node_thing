import { NODE_TYPES } from "@/utils/node-type";
import { RenderPipeline } from "./pipeline";
import { createUniform } from "./uniforms";
import { HandleType } from "@/schemas/node.schema";

const THREADS_PER_WORKGROUP = 16;

const N_CHANNELS = {
  number: 1,
  color: 4, // We actually only need vec3s, but alignment
} satisfies Record<HandleType, number>;

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
  const paddedSize = (nChannels: number) => {
    const bufSize = 4 * nChannels * ~~opts.width * ~~opts.height;
    return bufSize + (bufSize % 4);
  };

  return desc.bufferTypes.map((bufType) =>
    device.createBuffer({
      size: paddedSize(N_CHANNELS[bufType]),
      usage: GPUBufferUsage.STORAGE,
    }),
  );
}

/*
 * Create a dummy buffer used for fallback values
 */
function createDummyBuffer(device: GPUDevice) {
  return device.createBuffer({ size: 16, usage: GPUBufferUsage.STORAGE });
}

/*
 * Create binding group layout objects for each pipeline stage.
 * Each binding group contains bindings for all inputs and outputs
 * in that stage.
 */
function createBindGroupLayouts(device: GPUDevice, desc: RenderPipeline) {
  return desc.passes.map((pass) => {
    const inputs = Object.entries(pass.inputBindings);
    const outputs = Object.entries(pass.outputBindings);

    return device.createBindGroupLayout({
      entries: [
        ...inputs.map(
          (_, i): GPUBindGroupLayoutEntry => ({
            binding: i,
            visibility: GPUShaderStage.COMPUTE,
            buffer: { type: "read-only-storage" },
          }),
        ),
        ...outputs.map(
          (_, i): GPUBindGroupLayoutEntry => ({
            binding: i + inputs.length,
            visibility: GPUShaderStage.COMPUTE,
            buffer: { type: "storage" },
          }),
        ),
      ],
    });
  });
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
  dummyBuffers: GPUBuffer[],
) {
  return desc.passes.map((pass, i) => {
    const inputs = Object.entries(pass.inputBindings);
    const outputs = Object.entries(pass.outputBindings);

    return device.createBindGroup({
      layout: bindGroupLayouts[i],
      entries: [
        ...inputs.map(([, bufferIdx], i): GPUBindGroupEntry => {
          let buffer: GPUBuffer;
          if (bufferIdx === null) {
            buffer = createDummyBuffer(device);
            dummyBuffers.push(buffer);
          } else {
            buffer = buffers[bufferIdx];
          }

          return {
            binding: i,
            resource: { buffer },
          };
        }),
        ...outputs.map(
          ([, bufferIdx], i): GPUBindGroupEntry => ({
            binding: i + inputs.length,
            resource: { buffer: buffers[bufferIdx] },
          }),
        ),
      ],
    });
  });
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
  uniformBindGroupLayout: GPUBindGroupLayout,
) {
  const shaders = compileShaders(device, desc);

  return desc.passes.map((pass, i) =>
    device.createComputePipeline({
      compute: {
        module: shaders[pass.nodeType],
        entryPoint: "main",
      },
      layout: device.createPipelineLayout({
        bindGroupLayouts: [bindGroupLayouts[i], uniformBindGroupLayout],
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
) {
  const bindGroupLayouts = createBindGroupLayouts(device, desc);

  const dummyBuffers: GPUBuffer[] = [];
  const buffers = createBuffers(device, desc, opts);
  const bindGroups = createBindGroups(
    device,
    desc,
    bindGroupLayouts,
    buffers,
    dummyBuffers,
  );
  const uniform = createUniform(device);
  const pipelines = createComputePSOs(
    device,
    desc,
    bindGroupLayouts,
    uniform.bindGroupLayout,
  );

  // TODO pass render size in uniforms
  const finalStageShader = device.createShaderModule({
    code: `
    @group(0) @binding(0)
    var<storage, read> input: array<vec3f>;

    @group(0) @binding(1)
    var<storage, read> alpha: array<f32>;

    @group(0) @binding(2)
    var tex: texture_storage_2d<rgba8unorm, write>;

    struct Uniforms {
        width: u32,
        height: u32,
        has_alpha: u32,
    };

    @group(1) @binding(0)
    var<uniform> u: Uniforms;

    @compute @workgroup_size(16, 16)
    fn main(
      @builtin(global_invocation_id) id: vec3u
    ) {
      // Avoid accessing the buffer out of bounds
      if id.x >= u.width || id.y >= u.height {
          return;
      }
      let index = id.x + id.y * u.width;

      let color = input[index];
      if u.has_alpha != 0 {
        textureStore(tex, id.xy, vec4f(color * alpha[index], alpha[index]));
      } else {
        textureStore(tex, id.xy, vec4f(color, 1.0));
      }
    }
    `,
  });

  const finalStageLayout = device.createBindGroupLayout({
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.COMPUTE,
        buffer: {
          type: "read-only-storage",
        },
      },
      {
        binding: 1,
        visibility: GPUShaderStage.COMPUTE,
        buffer: {
          type: "read-only-storage",
        },
      },
      {
        binding: 2,
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
        bindGroupLayouts: [finalStageLayout, uniform.bindGroupLayout],
      }),
    }),
    layout: finalStageLayout,
  };

  return {
    desc,
    opts,
    buffers,
    dummyBuffers,
    bindGroups,
    pipelines,
    finalStage,
    uniform,
  };
}

type PreparedPipeline = ReturnType<typeof preparePipeline>;

/*
 * Executes a render pipeline, given the lists of PSOs and binding groups
 * for each stage.
 * Returns the buffer where the result is stored.
 */
export function render(
  device: GPUDevice,
  pipeline: PreparedPipeline,
  target: GPUTexture,
) {
  const { desc, opts, buffers, bindGroups, pipelines, finalStage, uniform } =
    pipeline;

  /*
   * Bind target texture to final stage
   */
  const alphaBuffer =
    desc.outputAlphaBuffer === -1 ? 0 : desc.outputAlphaBuffer;
  const finalStageBindGroup = device.createBindGroup({
    layout: finalStage.layout,
    entries: [
      {
        binding: 0,
        resource: { buffer: buffers[desc.outputBuffer] },
      },
      {
        binding: 1,
        resource: { buffer: buffers[alphaBuffer] },
      },
      {
        binding: 2,
        resource: target.createView(),
      },
    ],
  });

  /*
   * Update uniforms
   */
  const uniformValues = Uint32Array.from([
    opts.width,
    opts.height,
    desc.outputAlphaBuffer === -1 ? 0 : 1,
  ]);
  device.queue.writeBuffer(
    uniform.buffer,
    0,
    uniformValues,
    0,
    uniformValues.length,
  );

  /*
   * Create command encoder
   */
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
    pass.setBindGroup(1, uniform.bindGroup);
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
  finalPass.setBindGroup(0, finalStageBindGroup);
  finalPass.setBindGroup(1, uniform.bindGroup);
  finalPass.dispatchWorkgroups(
    Math.ceil(opts.width / THREADS_PER_WORKGROUP),
    Math.ceil(opts.height / THREADS_PER_WORKGROUP),
  );
  finalPass.end();

  device.queue.submit([enc.finish()]);
}
