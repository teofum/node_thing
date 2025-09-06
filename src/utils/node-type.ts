import { NodeType } from "@/schemas/node.schema";

import testUVShader from "@/shaders/test-uv.wgsl";
import testBWShader from "@/shaders/test-grayscale.wgsl";

export const NODE_TYPES = {
  __input: {
    name: "Special input node",
    shader: "",
    inputs: {},
    outputs: {
      out_a: {
        name: "out_a",
        type: "color",
      },
    },
    parameters: {},
  },
  __output: {
    name: "Special output node",
    shader: "",
    inputs: {
      in_a: {
        name: "in_a",
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
        name: "out_a",
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
        name: "in_a",
        type: "color",
      },
    },
    outputs: {
      out_a: {
        name: "out_a",
        type: "color",
      },
    },
    parameters: {},
  },
} satisfies Record<string, NodeType>;

export const NODE_TYPE_NAMES = Object.keys(
  NODE_TYPES,
) as (keyof typeof NODE_TYPES)[];
