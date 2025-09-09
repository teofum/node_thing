import { NodeType } from "@/schemas/node.schema";

import testUVShader from "@/shaders/test-uv.wgsl";
import testBWShader from "@/shaders/test-grayscale.wgsl";
import thresholdShader from "@/shaders/threshold-bw.wgsl";
import boxBlurShader from "@/shaders/box-blur.wgsl";
import gaussianBlurShader3x3 from "@/shaders/gaussian-blur-3x3.wgsl";
import gaussianBlurShader5x5 from "@/shaders/gaussian-blur-5x5.wgsl";
import mixShader from "@/shaders/mix.wgsl";

export const NODE_TYPES = {
  __input: {
    name: "Input",
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
    shader: "",
    inputs: {
      in_a: {
        name: "Layer output",
        type: "color",
      },
    },
    outputs: {},
    parameters: {},
  },
  test_uv: {
    name: "Test UV gradient",
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
  mix: {
    name: "Mix",
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
