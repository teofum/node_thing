import { Edge } from "@xyflow/react";

import { ShaderNode } from "@/schemas/node.schema";
import { Graph, GroupNode, isGroup, Layer } from "@/store/project.types";
import { zip } from "@/utils/zip";

function compareNodes(
  current: ShaderNode | GroupNode,
  last: ShaderNode | GroupNode,
  displaySelection: boolean,
) {
  if (current.id !== last.id) return true;

  if (isGroup(current) && isGroup(last))
    return compareGraphs(current.data, last.data, displaySelection);
  if (isGroup(current) || isGroup(last)) return true; // Should be unreachable

  if (
    JSON.stringify(current.data.parameters) !==
    JSON.stringify(last.data.parameters)
  )
    return true;

  return false;
}

function compareEdges(current: Edge, last: Edge, displaySelection: boolean) {
  if (current.id !== last.id) return true;
  if (current.source !== last.source) return true;
  if (current.sourceHandle !== last.sourceHandle) return true;
  if (current.target !== last.target) return true;
  if (current.targetHandle !== last.targetHandle) return true;

  if (displaySelection && current.selected !== last.selected) return true;

  return false;
}

export function compareGraphs(
  current: Graph,
  last: Graph,
  displaySelection: boolean,
) {
  /*
   * Compare nodes
   */
  if (current.nodes.length !== last.nodes.length) return true; // Nodes were added or removed
  for (const [currentNode, lastNode] of zip(current.nodes, last.nodes)) {
    if (compareNodes(currentNode, lastNode, displaySelection)) return true; // A node is different
  }

  /*
   * Compare edges
   */
  if (current.edges.length !== last.edges.length) return true; // Edges were added or removed
  for (const [currentEdge, lastEdge] of zip(current.edges, last.edges)) {
    if (compareEdges(currentEdge, lastEdge, displaySelection)) return true; // An edge is different
  }

  return false; // Nothing significant changed
}

export function compareLayerDims(current: Layer, last: Layer) {
  return (
    JSON.stringify({ ...current.size, ...current.position }) !==
    JSON.stringify({ ...last.size, ...last.position })
  );
}
