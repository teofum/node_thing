import { Edge } from "@xyflow/react";

import { ShaderNode } from "@/schemas/node.schema";

export function source(edge: Edge, nodes: ShaderNode[]) {
  return nodes.find((n) => n.id === edge.source);
}

export function target(edge: Edge, nodes: ShaderNode[]) {
  return nodes.find((n) => n.id === edge.target);
}

export function isGroupIO(edge: Edge, nodes: ShaderNode[]) {
  return (
    source(edge, nodes)?.data.type.startsWith("__group_") ||
    target(edge, nodes)?.data.type.startsWith("__group_")
  );
}
