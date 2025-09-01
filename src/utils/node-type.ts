import { NodeType } from "@/schemas/node.schema";

export const NODE_TYPES = {
  dummy: {
    name: "Test type 1",
    inputs: {},
    outputs: {},
    parameters: {},
  },
  foo: {
    name: "Test type foo",
    inputs: {},
    outputs: {},
    parameters: {},
  },
  bar: {
    name: "Test type bar",
    inputs: {
      foo: {
        name: "Foo",
        type: "color",
      },
    },
    outputs: {},
    parameters: {},
  },
  input: {
    name: "Input",
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
