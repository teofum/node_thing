import { NodeType } from "@/schemas/node.schema";

const testUVShader = `
@group(0) @binding(0)
var<storage, read_write> output: array<vec4f>;

@compute @workgroup_size(16, 16)
fn main(
  @builtin(global_invocation_id) id: vec3u,
) {
  // Avoid accessing the buffer out of bounds
  if (id.x >= 300 || id.y >= 200) {
    return;
  }

  output[id.x + id.y * 300] = vec4f(
      f32(id.x) / 300.0f,
      f32(id.y) / 200.0f,
      0, 1);
}
`;

const testBWShader = `
@group(0) @binding(0)
var<storage, read_write> input: array<vec4f>;

@group(0) @binding(1)
var<storage, read_write> output: array<vec4f>;

@compute @workgroup_size(16, 16)
fn main(
  @builtin(global_invocation_id) id: vec3u,
) {
  // Avoid accessing the buffer out of bounds
  if (id.x >= 300 || id.y >= 200) {
    return;
  }

  const luma = vec3f(0.2126, 0.7152, 0.0722);
  let in = input[id.x + id.y * 300].xyz;
  let val = dot(in, luma);

  output[id.x + id.y * 300] = vec4f(val, val, val, 1);
}
`;

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
  test_node_1to2: {
    name: "Test node: 1 to 2",
    shader: "",
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
      out_b: {
        name: "out_b",
        type: "color",
      },
    },
    parameters: {},
  },
  test_node_2to1: {
    name: "Test node: 2 to 1",
    shader: "",
    inputs: {
      in_a: {
        name: "in_a",
        type: "color",
      },
      in_b: {
        name: "in_b",
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
  test_node_3to1: {
    name: "Test node: 3 to 1",
    shader: "",
    inputs: {
      in_a: {
        name: "in_a",
        type: "color",
      },
      in_b: {
        name: "in_b",
        type: "color",
      },
      in_c: {
        name: "in_c",
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
