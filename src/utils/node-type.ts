import { NodeType } from "@/schemas/node.schema";

import testUVShader from "@/shaders/test-uv.wgsl";
import testBWShader from "@/shaders/test-grayscale.wgsl";
import thresholdShader from "@/shaders/threshold-bw.wgsl";
import boxBlurShader from "@/shaders/box-blur.wgsl";
import gaussianBlurShader3x3 from "@/shaders/gaussian-blur-3x3.wgsl";
import gaussianBlurShader5x5 from "@/shaders/gaussian-blur-5x5.wgsl";
import gaussianBlurShader from "@/shaders/gaussian-blur.wgsl";
import mixShader from "@/shaders/mix.wgsl";
import diffShader from "@/shaders/diff.wgsl";
import brightnessShader from "@/shaders/brightness.wgsl";
import splitChannelsShader from "@/shaders/extract-channel.wgsl";
import chromaticAberrationShader from "@/shaders/chromatic-aberration.wgsl";
import posterizerShader from "@/shaders/posterizer.wgsl";
import lumPosterizerShader from "@/shaders/luminance-posterizer.wgsl";
import basicSharpnessShader from "@/shaders/basicSharpness.wgsl";
import bloomShader from "@/shaders/bloom.wgsl";

export const NODE_TYPES = {
  // Input y output ///////////////////////////////
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
  test_uv: {
    name: "Test UV gradient",
    category: "Generate",
    shader: testUVShader,
    inputs: {},
    outputs: {
      out_a: {
        name: "UV grid",
        type: "color",
      },
    },
    parameters: {},
  }, // Utility category ///////////////////////////////
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
  }, // Blurs category ///////////////////////////////
  boxBlur: {
    name: "Box Blur",
    category: "Blurs",
    shader: boxBlurShader,
    inputs: {
      in_a: {
        name: "Input",
        type: "color",
      },
      kernelSize: {
        name: "Kernel size",
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
  gaussBlur: {
    name: "Gaussian blur",
    category: "Blurs",
    shader: gaussianBlurShader,
    inputs: {
      in_a: {
        name: "Input",
        type: "color",
      },
      kernelSize: {
        name: "Kernel size",
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
  }, // Blend category ///////////////////////////////
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
    name: "Diff",
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
  }, // Color category ///////////////////////////////
  test_bw: {
    name: "Test Grayscale",
    category: "Color",
    shader: testBWShader,
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
    name: "Threshold B/W",
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
  brightness: {
    name: "Brightness",
    category: "Color",
    shader: brightnessShader,
    inputs: {
      in_a: {
        name: "Input",
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
      magniR: { name: "magni R", type: "number" },
      magniG: { name: "magni G", type: "number" },
      magniB: { name: "magni B", type: "number" },
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
    name: "Posterizer",
    category: "Color",
    shader: posterizerShader,
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
  lumPosterizer: {
    name: "Luminance Posterizer",
    category: "Color",
    shader: lumPosterizerShader,
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
  basicSharpness: {
    name: "Basic Sharpness",
    category: "Color",
    shader: basicSharpnessShader,
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
