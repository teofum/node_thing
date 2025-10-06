import { nanoid } from "nanoid";

import { NodeData, NodeType, ShaderNode } from "@/schemas/node.schema";

export function createNode<T extends Record<string, NodeType>>(
  type: keyof T & string,
  position: { x: number; y: number },
  nodeTypes: T,
  parameters: Record<string, { value: string | null }>,
): ShaderNode {
  return {
    id: newNodeId(type),
    type: "RenderShaderNode",
    position,
    data: {
      type,
      defaultValues: getDefaultValues(nodeTypes, type),
      parameters,
    },
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
