import { Edge } from "@xyflow/react";

import { ShaderNode } from "@/schemas/node.schema";
import { Layer } from "@/store/project.store";
import { zip } from "@/utils/zip";

function compareNodes(current: ShaderNode, last: ShaderNode) {
  if (current.id !== last.id) return true;
  if (JSON.stringify(current.data) !== JSON.stringify(last.data)) return true;

  return false;
}

function compareEdges(current: Edge, last: Edge) {
  if (current.id !== last.id) return true;
  if (current.source !== last.source) return true;
  if (current.sourceHandle !== last.sourceHandle) return true;
  if (current.target !== last.target) return true;
  if (current.targetHandle !== last.targetHandle) return true;

  return false;
}

export function compareLayers(current: Layer, last: Layer) {
  /*
   * Compare nodes
   */
  if (current.nodes.length !== last.nodes.length) return true; // Nodes were added or removed
  for (const [currentNode, lastNode] of zip(current.nodes, last.nodes)) {
    if (compareNodes(currentNode, lastNode)) return true; // A node is different
  }

  /*
   * Compare edges
   */
  if (current.edges.length !== last.edges.length) return true; // Edges were added or removed
  for (const [currentEdge, lastEdge] of zip(current.edges, last.edges)) {
    if (compareEdges(currentEdge, lastEdge)) return true; // An edge is different
  }

  return false; // Nothing significant changed
}

export function compareLayerDims(current: Layer, last: Layer) {
  return (
    JSON.stringify({ ...current.size, ...current.position }) !==
    JSON.stringify({ ...last.size, ...last.position })
  );
}
