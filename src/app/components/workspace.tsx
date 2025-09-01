"use client";

import {
  ReactFlow,
  type FitViewOptions,
  type OnNodeDrag,
  type DefaultEdgeOptions,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ShaderNode } from "./shaderNode";
import { useStore } from "@/store/store";

const nodeTypes = {
  ShaderNode,
};

const fitViewOptions: FitViewOptions = {
  padding: 0.2,
};

const defaultEdgeOptions: DefaultEdgeOptions = {
  animated: true,
};

const onNodeDrag: OnNodeDrag = (_, node) => {
  console.log("drag event", node.data);
};

// NOTA: esto sería el ejemplo de uso, está todo guardado en zustand
export function Workspace() {
  const {
    layers,
    currentLayer,
    onNodesChange,
    onEdgesChange,
    setActiveLayer,
    onConnect,
  } = useStore();

  // obtengo la capa actual para imprimir
  const { nodes, edges } = layers[currentLayer];

  // TODO, acá debería hacer menejo por capas (ahora mismo solo muestra el grafo de la capa actual)

  return (
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
