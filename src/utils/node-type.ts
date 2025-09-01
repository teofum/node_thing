import { NodeType } from "@/schemas/node.schema";

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
  test_node_1to1: {
    name: "Test node: 1 to 1",
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
  input: {
    name: "Input",
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
  output: {
    name: "Output",
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
  middle: {
    name: "Middle",
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
    },
    parameters: {},
  },
} satisfies Record<string, NodeType>;

export const NODE_TYPE_NAMES = Object.keys(
  NODE_TYPES,
) as (keyof typeof NODE_TYPES)[];
