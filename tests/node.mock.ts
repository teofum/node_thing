import { NodeType } from "@/schemas/node.schema";

import mixShader from "@/shaders/mix.wgsl";

export const mockNodeTypes = {
  mix: {
    name: "Mix",
    category: "Blend",
    shader: mixShader,
    inputs: {
      input_a: {
        name: "A",
        type: "color",
      },
      input_b: {
        name: "B",
        type: "color",
      },
      factor: {
        name: "Factor",
        type: "number",
      },
    },
    outputs: {
      output: {
        name: "Output",
        type: "color",
      },
    },
    parameters: {
      test: {
        name: "Test",
        type: "select",
        options: ["Foo Bar", "Bob"],
      },
    },
    uniforms: {
      bob: { type: "f32", defaultValue: 0 },
      mike: { type: "vec3f", defaultValue: [0, 0, 0] },
    },
  },
} satisfies Record<string, NodeType>;
