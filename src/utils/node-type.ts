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
import brightness from "@/shaders/brightness.wgsl";
import splitChannelsShader from "@/shaders/extract-channel.wgsl";

export const NODE_TYPES = {
  __input: {
    name: "Input",
    category: "Special",
    shader: "",
    inputs: {},
    outputs: {
      out_a: {
        name: "Input",
        type: "color",
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
  },
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
  threshold: {
    name: "Threshold B/W",
    category: "Color",
    shader: thresholdShader,
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
  boxBlur: {
    name: "Box Blur",
    category: "Filters",
    shader: boxBlurShader,
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
  gaussBlur3x3: {
    name: "Gaussian blur 3x3",
    category: "Filters",
    shader: gaussianBlurShader3x3,
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
  gaussBlur5x5: {
    name: "Gaussian blur 5x5",
    category: "Filters",
    shader: gaussianBlurShader5x5,
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
  gaussBlur: {
    name: "Gaussian blur",
    shader: gaussianBlurShader,
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
  brightness: {
    name: "Brightness",
    shader: brightness,
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
} satisfies Record<string, NodeType>;

export const NODE_TYPE_NAMES = Object.keys(
  NODE_TYPES,
) as (keyof typeof NODE_TYPES)[];
