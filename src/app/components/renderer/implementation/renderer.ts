import { HandleType, NodeType } from "@/schemas/node.schema";
import { RenderPipeline } from "../pipeline";
import { generateShaderCode } from "../shader-codegen";
import {
  createBindGroupLayouts,
  createBindGroups,
  createLocalUniformsBuffers,
  DummyBuffer,
  PassBindGroupLayouts,
} from "./bindings";
import { createUniform } from "./uniforms";
import { createInputStage, createOutputStage } from "./io";
import { zip } from "@/utils/zip";

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
 * Compile all shaders used in the render graph.
 * Stored in a map, this allows for shader reuse (for example,
 * if a node is used twice).
 */
function compileShaders(
  device: GPUDevice,
  desc: RenderPipeline,
  nodeTypes: Record<string, NodeType>,
) {
  return desc.passes.map((pass) =>
    device.createShaderModule({
      code: generateShaderCode(pass, nodeTypes, desc.bufferTypes),
    }),
  );
}

/*
 * Create the pipeline state objects (PSOs) for each pipeline stage.
 * Each stage is implemented as a compute pipeline that runs one shader.
 */
function createComputePSOs(
  device: GPUDevice,
  desc: RenderPipeline,
  bindGroupLayouts: PassBindGroupLayouts[],
  uniformBindGroupLayout: GPUBindGroupLayout,
  nodeTypes: Record<string, NodeType>,
) {
  const shaders = compileShaders(device, desc, nodeTypes);

  return desc.passes.map((pass, i) =>
    device.createComputePipeline({
      compute: {
        module: shaders[i],
        entryPoint: "main",
      },
      layout: device.createPipelineLayout({
        bindGroupLayouts: [
          bindGroupLayouts[i].io,
          uniformBindGroupLayout,
          bindGroupLayouts[i].uniforms,
        ],
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
  nodeTypes: Record<string, NodeType>,
) {
  const bindGroupLayouts = createBindGroupLayouts(device, desc, nodeTypes);

  const dummyBuffers: DummyBuffer[] = [];
  const buffers = createBuffers(device, desc, opts);
  const localUniformsBuffers = createLocalUniformsBuffers(
    device,
    desc,
    nodeTypes,
  );
  const bindGroups = createBindGroups(
    device,
    desc,
    bindGroupLayouts,
    buffers,
    localUniformsBuffers,
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
  const outputStage = createOutputStage(
    desc,
    device,
    uniform.bindGroupLayout,
    nodeTypes,
  );

  return {
    desc,
    opts,
    buffers,
    localUniformsBuffers,
    dummyBuffers,
    bindGroups,
    pipelines,
    inputStage,
    outputStage,
    uniform,
    nodeTypes,
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
  frameIndex: number,
  time: number,
) {
  const {
    desc,
    opts,
    buffers,
    localUniformsBuffers,
    dummyBuffers,
    bindGroups,
    pipelines,
    inputStage,
    outputStage,
    uniform,
    nodeTypes,
  } = pipeline;

  const renderTarget = device.createTexture({
    format: "rgba8unorm",
    size: [target.width, target.height],
    usage:
      GPUTextureUsage.STORAGE_BINDING |
      GPUTextureUsage.COPY_SRC |
      GPUTextureUsage.COPY_DST,
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
    frameIndex,
    time,
  ]);
  device.queue.writeBuffer(
    uniform.buffer,
    0,
    uniformValues,
    0,
    uniformValues.length,
  );

  /*
   * Update local uniforms
   */
  for (const [pass, buffer, uniforms] of desc.passes.map(
    (p, i) =>
      [p, localUniformsBuffers[i], nodeTypes[p.nodeType].uniforms] as const,
  )) {
    if (uniforms && pass.uniforms && buffer) {
      let offset = 0;

      for (const [type, value] of zip(
        Object.values(uniforms).map((u) => u.type),
        Object.values(pass.uniforms),
      )) {
        switch (type) {
          case "u32": {
            const v = Uint32Array.from([value as number]);
            device.queue.writeBuffer(buffer, offset, v, 0, v.length);
            offset += 4;
            break;
          }
          case "f32": {
            const v = Float32Array.from([value as number]);
            device.queue.writeBuffer(buffer, offset, v, 0, v.length);
            offset += 4;
            break;
          }
          default: {
            const v = Float32Array.from(value as number[]);
            device.queue.writeBuffer(buffer, offset, v, 0, v.length);
            offset += 4 * v.length;
            break;
          }
        }
      }
    }
  }

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

  enc.copyTextureToTexture({ texture: target }, { texture: renderTarget }, [
    target.width,
    target.height,
  ]);

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
    pass.setBindGroup(0, bindGroup.io);
    pass.setBindGroup(1, uniform.bindGroup);
    pass.setBindGroup(2, bindGroup.uniforms);
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
