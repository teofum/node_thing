import { NodeType } from "@/schemas/node.schema";

import uvShader from "@/shaders/uv.wgsl";
import grayscaleShader from "@/shaders/grayscale.wgsl";
import thresholdShader from "@/shaders/threshold.wgsl";
import extThresholdShader from "@/shaders/threshold_ext.wgsl";
import boxBlurShader from "@/shaders/box-blur.wgsl";
import gaussianBlurXShader from "@/shaders/gaussian-blur-x.wgsl";
import gaussianBlurYShader from "@/shaders/gaussian-blur-y.wgsl";
import mixShader from "@/shaders/mix.wgsl";
import diffShader from "@/shaders/diff.wgsl";
import extDiffShader from "@/shaders/diff_ext.wgsl";
import exposureShader from "@/shaders/exposure.wgsl";
import splitChannelsShader from "@/shaders/extract-channel.wgsl";
import mergeChannelsShader from "@/shaders/combine-channels.wgsl";
import chromaticAberrationShader from "@/shaders/chromatic-aberration.wgsl";
import posterizeShader from "@/shaders/posterize.wgsl";
import sharpnessShader from "@/shaders/sharpness.wgsl";
import bloomShader from "@/shaders/bloom.wgsl";
import addShader from "@/shaders/add.wgsl";
import multiplyShader from "@/shaders/multiply.wgsl";
import absShader from "@/shaders/abs.wgsl";
import constantShader from "@/shaders/constant.wgsl";
import whiteNoiseShader from "@/shaders/white-noise.wgsl";

export const NODE_TYPES = {
  // Input & output ///////////////////////////////
  __input_image: {
    name: "Image",
    category: "Input",
    shader: "",
    inputs: {},
    outputs: {
      color: {
        name: "Color",
        type: "color",
      },
      alpha: {
        name: "Alpha",
        type: "number",
      },
    },
    parameters: {
      image: {
        name: "Image",
        type: "image",
      },
    },
  },
  __input_layer: {
    name: "Underlying layer",
    category: "Input",
    shader: "",
    inputs: {},
    outputs: {
      color: {
        name: "Color",
        type: "color",
      },
      alpha: {
        name: "Alpha",
        type: "number",
      },
    },
    parameters: {},
  },
  uv: {
    name: "UV",
    category: "Input",
    shader: uvShader,
    inputs: {},
    outputs: {
      u: {
        name: "U",
        type: "number",
      },
      v: {
        name: "V",
        type: "number",
      },
    },
    parameters: {},
  },
  __output: {
    name: "Output",
    category: "Special",
    shader: "",
    inputs: {
      output_color: {
        name: "Layer output",
        type: "color",
      },
      alpha: {
        name: "Layer alpha",
        type: "number",
      },
    },
    outputs: {},
    parameters: {},
  },
  // Generate category ///////////////////////////////
  white_noise: {
    name: "White Noise",
    category: "Generate",
    shader: whiteNoiseShader,
    inputs: {},
    outputs: {
      output: {
        name: "Noise",
        type: "number",
      },
    },
    parameters: {},
  },
  // Math category ///////////////////////////////
  constant: {
    name: "Constant",
    category: "Math",
    shader: constantShader,
    inputs: {
      in_a: {
        name: "Value",
        type: "number",
      },
    },
    outputs: {
      out_a: {
        name: "k",
        type: "number",
      },
    },
    parameters: {},
  },
  add: {
    name: "Add",
    category: "Math",
    shader: addShader,
    inputs: {
      in_a: {
        name: "x",
        type: "number",
      },
      in_b: {
        name: "y",
        type: "number",
      },
    },
    outputs: {
      out_a: {
        name: "x + y",
        type: "number",
      },
    },
    parameters: {},
  },
  multiply: {
    name: "Multiply",
    category: "Math",
    shader: multiplyShader,
    inputs: {
      in_a: {
        name: "x",
        type: "number",
      },
      in_b: {
        name: "y",
        type: "number",
      },
    },
    outputs: {
      out_a: {
        name: "x × y",
        type: "number",
      },
    },
    parameters: {},
  },
  abs: {
    name: "Absolute value",
    category: "Math",
    shader: absShader,
    inputs: {
      in_a: {
        name: "x",
        type: "number",
      },
    },
    outputs: {
      out_a: {
        name: "|x|",
        type: "number",
      },
    },
    parameters: {},
  },
  // Filters category ///////////////////////////////
  boxBlur: {
    name: "Box Blur",
    category: "Filter",
    shader: boxBlurShader,
    inputs: {
      in_a: {
        name: "Input",
        type: "color",
      },
      kernelSize: {
        name: "Radius",
        type: "number",
        max: 25,
        step: 1,
      },
    },
    outputs: {
      out_a: {
        name: "Output",
        type: "color",
      },
    },
    parameters: {},
  },
  gaussBlur: {
    name: "Gaussian blur",
    category: "Filter",
    shader: gaussianBlurXShader,
    inputs: {
      in_a: {
        name: "Input",
        type: "color",
      },
      std_dev: {
        name: "Std. dev",
        type: "number",
        min: 0.1,
        max: 50,
        step: 0.1,
      },
    },
    outputs: {
      out_a: {
        name: "Output",
        type: "color",
      },
    },
    parameters: {},
    additionalPasses: [
      {
        shader: gaussianBlurYShader,
        buffers: [
          { name: "image", type: "color" },
          { name: "std_dev", type: "number" },
        ],
      },
    ],
  },
  sharpness: {
    name: "Sharpness",
    category: "Filter",
    shader: sharpnessShader,
    inputs: {
      in_a: {
        name: "Input",
        type: "color",
      },
    },
    outputs: {
      out_a: {
        name: "Output",
        type: "color",
      },
    },
    parameters: {},
  },
  // Blend category ///////////////////////////////
  mix: {
    name: "Mix",
    category: "Blend",
    shader: mixShader,
    inputs: {
      in_a: {
        name: "A",
        type: "color",
      },
      in_b: {
        name: "B",
        type: "color",
      },
      factor: {
        name: "Factor",
        type: "number",
      },
    },
    outputs: {
      out_a: {
        name: "Output",
        type: "color",
      },
    },
    parameters: {},
  },
  diff: {
    name: "Difference",
    category: "Blend",
    shader: diffShader,
    inputs: {
      in_a: {
        name: "A",
        type: "color",
      },
      in_b: {
        name: "B",
        type: "color",
      },
    },
    outputs: {
      out_a: {
        name: "Output",
        type: "color",
      },
    },
    parameters: {},
  },
  diffExt: {
    name: "Extended Difference",
    category: "Blend",
    shader: extDiffShader,
    inputs: {
      in_a: {
        name: "A",
        type: "color",
      },
      in_b: {
        name: "B",
        type: "color",
      },
      factor: {
        name: "Tau",
        type: "number",
      },
    },
    outputs: {
      out_a: {
        name: "Output",
        type: "color",
      },
    },
    parameters: {},
  },
  // Color category ///////////////////////////////
  grayscale: {
    name: "Grayscale",
    category: "Color",
    shader: grayscaleShader,
    inputs: {
      in_a: {
        name: "Input",
        type: "color",
      },
    },
    outputs: {
      out_a: {
        name: "Output",
        type: "color",
      },
    },
    parameters: {},
  },
  threshold: {
    name: "Threshold",
    category: "Color",
    shader: thresholdShader,
    inputs: {
      in_a: {
        name: "Input",
        type: "color",
      },
      threshold: {
        name: "Threshold",
        type: "number",
      },
    },
    outputs: {
      out_a: {
        name: "Output",
        type: "color",
      },
    },
    parameters: {},
  },
  threshold_ext: {
    name: "Extended Threshold",
    category: "Color",
    shader: extThresholdShader,
    inputs: {
      in_a: {
        name: "Input",
        type: "color",
      },
      threshold: {
        name: "Threshold",
        type: "number",
      },
      phi: {
        name: "Falloff",
        type: "number",
      },
    },
    outputs: {
      out_a: {
        name: "Output",
        type: "color",
      },
    },
    parameters: {},
  },
  exposure: {
    name: "Exposure",
    category: "Color",
    shader: exposureShader,
    inputs: {
      in_a: {
        name: "Input",
        type: "color",
      },
      factor: {
        name: "EV",
        type: "number",
        min: -5,
        max: 5,
        step: 0.1,
      },
    },
    outputs: {
      out_a: {
        name: "Output",
        type: "color",
      },
    },
    parameters: {},
  },
  // Effects category ///////////////////////////////
  chromaticAberration: {
    name: "Chromatic Aberration",
    category: "Effects",
    shader: chromaticAberrationShader,
    inputs: {
      in_a: {
        name: "Input",
        type: "color",
      },
      angleR: { name: "Angle R", type: "number" },
      angleG: { name: "Angle G", type: "number" },
      angleB: { name: "Angle B", type: "number" },
      magniR: { name: "Magnitude R", type: "number" },
      magniG: { name: "Magnitude G", type: "number" },
      magniB: { name: "Magnitude B", type: "number" },
    },
    outputs: {
      out_a: {
        name: "Output",
        type: "color",
      },
    },
    parameters: {},
  },
  posterize: {
    name: "Posterize",
    category: "Effects",
    shader: posterizeShader,
    inputs: {
      in_a: {
        name: "Input",
        type: "color",
      },
      steps: {
        name: "Steps",
        type: "number",
        min: 2,
        max: 16,
        step: 1,
      },
    },
    outputs: {
      out_a: {
        name: "Output",
        type: "color",
      },
    },
    parameters: {},
  },
  bloom: {
    name: "Bloom",
    category: "Effects",
    shader: bloomShader,
    inputs: {
      in_a: {
        name: "Input",
        type: "color",
      },
      std_dev: {
        name: "Std. dev",
        type: "number",
        min: 0.1,
        max: 10,
        step: 0.1,
      },
      threshold: {
        name: "Threshold",
        type: "number",
      },
    },
    outputs: {
      out_a: {
        name: "Output",
        type: "color",
      },
    },
    parameters: {},
  },
  // Utility category ///////////////////////////////
  split_channels: {
    name: "Split channels",
    category: "Utility",
    shader: splitChannelsShader,
    inputs: {
      in_a: {
        name: "Color",
        type: "color",
      },
    },
    outputs: {
      red: {
        name: "R",
        type: "number",
      },
      green: {
        name: "G",
        type: "number",
      },
      blue: {
        name: "B",
        type: "number",
      },
    },
    parameters: {},
  },
  merge_channels: {
    name: "Merge channels",
    category: "Utility",
    shader: mergeChannelsShader,
    inputs: {
      red: {
        name: "R",
        type: "number",
      },
      green: {
        name: "G",
        type: "number",
      },
      blue: {
        name: "B",
        type: "number",
      },
    },
    outputs: {
      output: {
        name: "Color",
        type: "color",
      },
    },
    parameters: {},
  },
} satisfies Record<string, NodeType>;

export const NODE_TYPE_NAMES = Object.keys(
  NODE_TYPES,
) as (keyof typeof NODE_TYPES)[];
