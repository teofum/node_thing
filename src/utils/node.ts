import { nanoid } from "nanoid";

import { Handle, NodeData, NodeType, ShaderNode } from "@/schemas/node.schema";
import { GroupNode } from "@/store/project.types";

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
      defaultValues: getDefaultValues(nodeTypes[type]),
      parameters: {
        ...getDefaultParameters(nodeTypes[type]),
        ...parameters,
      },
      uniforms: getDefaultUniforms(nodeTypes[type]),
    },
    selected: true,
  };
}

function getDefaultUniforms(type: NodeType) {
  if (!type.uniforms) return {};

  const uniforms: NodeData["uniforms"] = {};
  for (const [key, uniform] of Object.entries(type.uniforms)) {
    uniforms[key] = uniform.defaultValue;
  }

  return uniforms;
}

function getDefaultParameters(type: NodeType) {
  const parameters: NodeData["parameters"] = {};
  for (const [key, param] of Object.entries(type.parameters)) {
    if (param.type === "select") parameters[key] = { value: "0" };
  }

  return parameters;
}

function getDefaultValues(type: NodeType) {
  const defaultValues: NodeData["defaultValues"] = {};
  for (const [key, input] of Object.entries(type.inputs)) {
    defaultValues[key] = input.default ?? getDefaultDefaultValue(input);
  }
  return defaultValues;
}

function getDefaultDefaultValue(input: Handle): number | number[] {
  if (input.type === "color") return [0.8, 0.8, 0.8, 1];

  let value = 0;
  if (input.min !== undefined && input.max !== undefined)
    value = (input.min + input.max) / 2;
  if (input.step !== undefined)
    value = Math.round(value / input.step) * input.step;

  return value;
}

export function createGroup(position: { x: number; y: number }): GroupNode {
  return {
    id: newNodeId("group"),
    type: "RenderGroupNode",
    position,
    data: {
      group: true,
      nodes: [],
      edges: [],
    },
    selected: true,
  };
}

function newNodeId(type: string) {
  return `${type.startsWith("__") ? `${type}_` : ""}${nanoid()}`;
}
