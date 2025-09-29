import { HandleType, NodeType } from "@/schemas/node.schema";
import { RenderPass, RenderPipeline } from "./pipeline";
import { createUniform } from "./uniforms";
import { generateShaderCode } from "./shader-codegen";

import outputShader from "@/shaders/output.wgsl";
import inputShader from "@/shaders/input.wgsl";
import layerShader from "@/shaders/layer-under.wgsl";

const THREADS_PER_WORKGROUP = 16;

const N_CHANNELS = {
  number: 1,
  color: 4, // We actually only need vec3s, but alignment
} satisfies Record<HandleType, number>;

export type RenderOptions = {
  x: number;
  y: number;
  width: number;
  height: number;
  globalWidth: number;
  globalHeight: number;
};

type DummyBuffer = {
  buffer: GPUBuffer;
  pass: RenderPass;
  input: string;
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
  return device.createBuffer({
    size: 16,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });
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
  dummyBuffers: DummyBuffer[],
) {
  return desc.passes.map((pass, passIdx) => {
    const inputs = Object.entries(pass.inputBindings);
    const outputs = Object.entries(pass.outputBindings);

    return device.createBindGroup({
      layout: bindGroupLayouts[passIdx],
      entries: [
        ...inputs.map(([input, bufferIdx], i): GPUBindGroupEntry => {
          let buffer: GPUBuffer;
          if (bufferIdx === null) {
            buffer = createDummyBuffer(device);
            dummyBuffers.push({ buffer, input, pass });
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
function compileShaders(
  device: GPUDevice,
  desc: RenderPipeline,
  nodeTypes: Record<string, NodeType>,
) {
  const shaders: Record<string, GPUShaderModule> = {};

  for (const pass of desc.passes) {
    shaders[`${pass.nodeType}_${pass.shader}`] = device.createShaderModule({
      code: generateShaderCode(pass, nodeTypes),
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
  nodeTypes: Record<string, NodeType>,
) {
  const shaders = compileShaders(device, desc, nodeTypes);

  return desc.passes.map((pass, i) =>
    device.createComputePipeline({
      compute: {
        module: shaders[`${pass.nodeType}_${pass.shader}`],
        entryPoint: "main",
      },
      layout: device.createPipelineLayout({
        bindGroupLayouts: [bindGroupLayouts[i], uniformBindGroupLayout],
      }),
    }),
  );
}

function createInputStage(
  device: GPUDevice,
  uniformBindGroupLayout: GPUBindGroupLayout,
) {
  const inputStageImageShader = device.createShaderModule({
    code: inputShader,
  });

  const inputStageLayerShader = device.createShaderModule({
    code: layerShader,
  });

  const inputStageLayout = device.createBindGroupLayout({
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
        buffer: {
          type: "storage",
        },
      },
      {
        binding: 2,
        visibility: GPUShaderStage.COMPUTE,
        texture: {},
      },
      {
        binding: 3,
        visibility: GPUShaderStage.COMPUTE,
        sampler: {},
      },
    ],
  });

  return {
    __input_image: device.createComputePipeline({
      compute: {
        module: inputStageImageShader,
        entryPoint: "main",
      },
      layout: device.createPipelineLayout({
        bindGroupLayouts: [inputStageLayout, uniformBindGroupLayout],
      }),
    }),
    __input_layer: device.createComputePipeline({
      compute: {
        module: inputStageLayerShader,
        entryPoint: "main",
      },
      layout: device.createPipelineLayout({
        bindGroupLayouts: [inputStageLayout, uniformBindGroupLayout],
      }),
    }),
  };
}

function createOuputStage(
  device: GPUDevice,
  uniformBindGroupLayout: GPUBindGroupLayout,
) {
  const outputStageShader = device.createShaderModule({
    code: outputShader,
  });

  const outputStageLayout = device.createBindGroupLayout({
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

  return device.createComputePipeline({
    compute: {
      module: outputStageShader,
      entryPoint: "main",
    },
    layout: device.createPipelineLayout({
      bindGroupLayouts: [outputStageLayout, uniformBindGroupLayout],
    }),
  });
}

/*
 * Prepare a render pipeline for rendering by creating all the necessary
 * objects: buffers, binding groups, and compute PSOs.
 */
export function preparePipeline(
  device: GPUDevice,
  desc: RenderPipeline,
  opts: RenderOptions,
  nodeTypes: Record<string, NodeType>,
) {
  const bindGroupLayouts = createBindGroupLayouts(device, desc);

  const dummyBuffers: DummyBuffer[] = [];
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
    nodeTypes,
  );

  const inputStage = createInputStage(device, uniform.bindGroupLayout);
  const outputStage = createOuputStage(device, uniform.bindGroupLayout);

  return {
    desc,
    opts,
    buffers,
    dummyBuffers,
    bindGroups,
    pipelines,
    inputStage,
    outputStage,
    uniform,
  };
}

export type PreparedPipeline = ReturnType<typeof preparePipeline>;

/*
 * Executes a render pipeline, given the lists of PSOs and binding groups
 * for each stage.
 * Returns the buffer where the result is stored.
 */
export function render(
  device: GPUDevice,
  pipeline: PreparedPipeline,
  target: GPUTexture,
  textures: [string, GPUTexture][],
  sampler: GPUSampler,
) {
  const {
    desc,
    opts,
    buffers,
    dummyBuffers,
    bindGroups,
    pipelines,
    inputStage,
    outputStage,
    uniform,
  } = pipeline;

  const renderTarget = device.createTexture({
    format: "rgba8unorm",
    size: [target.width, target.height],
    usage: GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.COPY_SRC,
  });

  /*
   * Bind target texture to final stage
   */
  const alphaBuffer =
    desc.outputAlphaBuffer === -1 ? 0 : desc.outputAlphaBuffer;
  const outputStageBindGroup = device.createBindGroup({
    layout: outputStage.getBindGroupLayout(0),
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
        resource: renderTarget.createView(),
      },
    ],
  });

  /*
   * Update uniforms
   */
  const uniformValues = Uint32Array.from([
    opts.width,
    opts.height,
    opts.x,
    opts.y,
    opts.globalWidth,
    opts.globalHeight,
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
   * Fill in dummy buffers
   */
  for (const buf of dummyBuffers) {
    const value = buf.pass.defaultInputValues[buf.input] ?? 0;

    const values = Float32Array.from(
      typeof value === "number" ? [value, 0, 0, 0] : value,
    );
    device.queue.writeBuffer(buf.buffer, 0, values, 0, values.length);
  }

  /*
   * Create command encoder
   */
  const enc = device.createCommandEncoder();

  for (const input of desc.inputs) {
    let texture: GPUTexture;
    switch (input.type) {
      case "__input_image": {
        const textureEntry = textures.find(([name]) => name === input.image);
        if (!textureEntry) continue;

        [, texture] = textureEntry;
        break;
      }
      case "__input_layer": {
        texture = target;
        break;
      }
      default:
        continue;
    }

    const bindGroup = device.createBindGroup({
      layout: inputStage[input.type].getBindGroupLayout(0),
      entries: [
        {
          binding: 0,
          resource: { buffer: buffers[input.outputBindings.color] },
        },
        {
          binding: 1,
          resource: { buffer: buffers[input.outputBindings.alpha] },
        },
        {
          binding: 2,
          resource: texture.createView(),
        },
        {
          binding: 3,
          resource: sampler,
        },
      ],
    });

    const pass = enc.beginComputePass();
    pass.setPipeline(inputStage[input.type]);
    pass.setBindGroup(0, bindGroup);
    pass.setBindGroup(1, uniform.bindGroup);
    pass.dispatchWorkgroups(
      Math.ceil(opts.width / THREADS_PER_WORKGROUP),
      Math.ceil(opts.height / THREADS_PER_WORKGROUP),
    );
    pass.end();
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
  const outputPass = enc.beginComputePass();
  outputPass.setPipeline(outputStage);
  outputPass.setBindGroup(0, outputStageBindGroup);
  outputPass.setBindGroup(1, uniform.bindGroup);
  outputPass.dispatchWorkgroups(
    Math.ceil(opts.width / THREADS_PER_WORKGROUP),
    Math.ceil(opts.height / THREADS_PER_WORKGROUP),
  );
  outputPass.end();

  enc.copyTextureToTexture({ texture: renderTarget }, { texture: target }, [
    target.width,
    target.height,
  ]);

  device.queue.submit([enc.finish()]);
}
