import { NodeType } from "@/schemas/node.schema";
import { RenderPipeline } from "../pipeline";
import { generateOutputShaderCode } from "./shader-codegen";

import inputShader from "@/shaders/input.wgsl";
import layerShader from "@/shaders/layer-under.wgsl";
import outputShader from "@/shaders/output.wgsl";

export function createInputStage(
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

export function createOutputStage(
  desc: RenderPipeline,
  device: GPUDevice,
  uniformBindGroupLayout: GPUBindGroupLayout,
  nodeTypes: Record<string, NodeType>,
) {
  const outputStageShader = device.createShaderModule({
    code: generateOutputShaderCode(
      outputShader,
      nodeTypes,
      desc.bufferTypes,
      desc.outputBuffer,
      desc.outputAlphaBuffer,
    ),
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
