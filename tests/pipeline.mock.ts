import { ShaderNode } from "@/schemas/node.schema";
import { createNode } from "@/utils/node";
import { NODE_TYPES } from "@/utils/node-type";
import { Edge } from "@xyflow/react";

export function getNodesForTesting() {
  const output = createNode("__output", { x: 0, y: 0 }, NODE_TYPES, {});
  const mix = createNode("mix", { x: 0, y: 0 }, NODE_TYPES, {});
  const gray = createNode("saturation", { x: 0, y: 0 }, NODE_TYPES, {});
  const threshold = createNode("threshold", { x: 0, y: 0 }, NODE_TYPES, {});
  const input = createNode("__input_image", { x: 0, y: 0 }, NODE_TYPES, {});

  return {
    output,
    mix,
    gray,
    threshold,
    input,
  };
}

export function edge<
  S extends keyof typeof NODE_TYPES,
  T extends keyof typeof NODE_TYPES,
>(
  source: ShaderNode & { data: { type: S } },
  target: ShaderNode & { data: { type: T } },
) {
  return {
    with: (
      output: keyof (typeof NODE_TYPES)[(typeof source)["data"]["type"]]["outputs"] &
        string,
      input: keyof (typeof NODE_TYPES)[(typeof target)["data"]["type"]]["inputs"] &
        string,
    ) => {
      return {
        id: "__test__",
        source: source.id,
        target: target.id,
        sourceHandle: output,
        targetHandle: input,
      } satisfies Edge;
    },
  };
}
