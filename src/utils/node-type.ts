import { NodeType } from "@/schemas/node.schema";

import uvShader from "@/shaders/uv.wgsl";
import grayscaleShader from "@/shaders/grayscale.wgsl";
import thresholdShader from "@/shaders/threshold.wgsl";
import boxBlurShader from "@/shaders/box-blur.wgsl";
import gaussianBlurShader from "@/shaders/gaussian-blur.wgsl";
import mixShader from "@/shaders/mix.wgsl";
import diffShader from "@/shaders/diff.wgsl";
import exposureShader from "@/shaders/exposure.wgsl";
import splitChannelsShader from "@/shaders/extract-channel.wgsl";
import chromaticAberrationShader from "@/shaders/chromatic-aberration.wgsl";
import posterizeShader from "@/shaders/posterize.wgsl";
import sharpnessShader from "@/shaders/sharpness.wgsl";
import bloomShader from "@/shaders/bloom.wgsl";

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
  // Utility category ///////////////////////////////
  split_channels: {
    name: "Split channels",
    category: "Utility",
    shader: splitChannelsShader,
    inputs: {
      in_a: {
        name: "Input",
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
        name: "Kernel size",
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
    shader: gaussianBlurShader,
    inputs: {
      in_a: {
        name: "Input",
        type: "color",
      },
      kernelSize: {
        name: "Kernel size",
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
  basicSharpness: {
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
      Threshold: {
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
  chromaticAberration: {
    name: "Chromatic Aberration",
    category: "Color",
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
  posterizer: {
    name: "Posterize",
    category: "Color",
    shader: posterizeShader,
    inputs: {
      in_a: {
        name: "Input",
        type: "color",
      },
      range: {
        name: "Range",
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
  bloom: {
    name: "Bloom",
    category: "Color",
    shader: bloomShader,
    inputs: {
      in_a: {
        name: "Input",
        type: "color",
      },
      kernelSize: {
        name: "Kernel size",
        type: "number",
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
} satisfies Record<string, NodeType>;

export const NODE_TYPE_NAMES = Object.keys(
  NODE_TYPES,
) as (keyof typeof NODE_TYPES)[];
