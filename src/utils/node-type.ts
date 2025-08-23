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
} satisfies Record<string, NodeType>;

export const NODE_TYPE_NAMES = Object.keys(
  NODE_TYPES,
) as (keyof typeof NODE_TYPES)[];
