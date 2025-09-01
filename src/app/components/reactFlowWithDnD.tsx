"use client";

import { useRef, useCallback } from "react";
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  useReactFlow,
  Background,
  type Node,
  type Edge,
  type OnConnect,
  MiniMap,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useStore } from "@/store/store";

import { useDnD } from "./dndContext";

// TODO esto volarlo, relacionado con lo de IDs duplicadas
let id = 0;
const getId = () => `dndnode_${id++}`;

export function ReactFlowWithDnD() {
  // NOTA: esto sería el ejemplo de uso, está todo guardado en zustand
  const {
    layers,
    currentLayer,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    setActiveLayer,
    onConnect,
  } = useStore();

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();
  const [type] = useDnD();

  // obtengo la capa actual para imprimir
  const { nodes, edges } = layers[currentLayer];

  // TODO, acá debería hacer menejo por capas (ahora mismo solo muestra el grafo de la capa actual)

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: getId(),
        type,
        position,
        data: { label: `${type} node` },
      };

      setNodes([...nodes, newNode]);
    },
    [screenToFlowPosition, type, setNodes],
  );

  return (
    <div className="w-full h-full" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        colorMode="dark"
        fitView
      >
        <Controls />
        <Background />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
