"use client"; // TODO this ok?

import { useState, useCallback } from "react";
import {
  ReactFlow,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  type Node,
  type Edge,
  type FitViewOptions,
  type OnConnect,
  type OnNodesChange,
  type OnEdgesChange,
  type OnNodeDrag,
  type DefaultEdgeOptions,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ShaderNode } from "./shaderNode";
import { NODE_TYPE_NAMES, NODE_TYPES } from "@/utils/node-type";
// import { Node } from "@/schemas/node.schema";

const nodeTypes = {
  ShaderNode,
};

// TODO debug
const testNode1 = { id: "testid1", type: "input" };
const testNode2 = { id: "testid2", type: "middle" };
const testNode3 = { id: "testid3", type: "output" };

const initialNodes: Node[] = [
  { id: "1", data: { label: "Node 1" }, position: { x: 5, y: 5 } },
  { id: "2", data: { label: "Node 2" }, position: { x: 5, y: 100 } },

  // ejemplo de uso de ShaderNode
  {
    id: "test1",
    type: "ShaderNode",
    data: {
      node: testNode1,
    },
    position: { x: 0, y: 5 },
  },
  {
    id: "test2",
    type: "ShaderNode",
    data: {
      node: testNode2,
    },
    position: { x: 30, y: 5 },
  },
  {
    id: "test3",
    type: "ShaderNode",
    data: {
      node: testNode3,
    },
    position: { x: 60, y: 5 },
  },
];

const initialEdges: Edge[] = [{ id: "e1-2", source: "1", target: "2" }];

const fitViewOptions: FitViewOptions = {
  padding: 0.2,
};

const defaultEdgeOptions: DefaultEdgeOptions = {
  animated: true,
};

const onNodeDrag: OnNodeDrag = (_, node) => {
  console.log("drag event", node.data);
};

export function Workspace() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes],
  );
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges],
  );
  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges],
  );

  return (
    // esto es el "canvas principal" para React Flow
    // tiene un CSS modificando esto en /node_modules/@xyflow/react/dist/style.css

    // TODO meto tailwind de juguete, esto puede estar mal
    <div className="w-screen h-screen border-6">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDrag={onNodeDrag}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={fitViewOptions}
        defaultEdgeOptions={defaultEdgeOptions}
      />
    </div>
  );
}
