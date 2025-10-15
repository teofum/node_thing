import { nanoid } from "nanoid";

import { NodeData, NodeType, ShaderNode } from "@/schemas/node.schema";

export function createNode<
  N extends Record<string, NodeType>,
  T extends keyof N & string,
>(
  type: T,
  position: { x: number; y: number },
  nodeTypes: N,
  parameters: Record<string, { value: string | null }>,
): Omit<ShaderNode, "data"> & {
  data: Omit<ShaderNode["data"], "type"> & { type: T };
} {
  return {
    id: newNodeId(type),
    type: "RenderShaderNode",
    position,
    data: {
      type,
      defaultValues: getDefaultValues(nodeTypes, type),
      parameters,
    },
    selected: true,
  };
}

function getDefaultValues(nodeTypes: Record<string, NodeType>, type: string) {
  const defaultValues: NodeData["defaultValues"] = {};
  for (const [key, input] of Object.entries(nodeTypes[type].inputs)) {
    defaultValues[key] = input.type === "number" ? 0.5 : [0.8, 0.8, 0.8, 1];
  }
  return defaultValues;
}

function newNodeId(type: string) {
  return `${type.startsWith("__input") || type === "__output" ? `${type}_` : ""}${nanoid()}`;
}
