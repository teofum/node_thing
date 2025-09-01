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
import { ReactFlowProvider } from "@xyflow/react";
import { DnDProvider } from "./dndContext";
import { Sidebar } from "./sidebar";
import { ReactFlowWithDnD } from "./dndFlow";

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
  // TODO esto estandarizarlo acá
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
    <>
      <div className="w-auto h-auto border-6">
        <ReactFlowProvider>
          <DnDProvider>
            <div className="flex h-screen">
              {/* Sidebar a la izquierda */}
              <div className="w-1/4">
                <Sidebar />
              </div>

              {/* Canvas a la derecha */}
              <div className="flex-1">
                <ReactFlowWithDnD />
              </div>
            </div>
          </DnDProvider>
        </ReactFlowProvider>
      </div>
    </>
  );
}
