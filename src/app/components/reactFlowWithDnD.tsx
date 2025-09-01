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
import { ShaderNode, useStore } from "@/store/store";
import { RenderShaderNode } from "./renderShaderNode";
import { NodeData } from "@/schemas/node.schema";

// TODO esto volarlo, relacionado con lo de IDs duplicadas
let id = 0;
const getId = () => `dndnode_${id++}`;

const nodeTypes = {
  RenderShaderNode,
};

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
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // TODO borrar a futuro
      const currId = getId();

      // TODO esto hardcodeo, instancio siempre un ShaderNode con tipo interno "middle"
      const newNode: ShaderNode = {
        id: currId,
        type: "RenderShaderNode", // hardcodeo
        position,
        data: {
          type: event.dataTransfer.getData("type") as NodeData["type"],
        },
      };

      setNodes([...useStore.getState().layers[currentLayer].nodes, newNode]);
    },
    [screenToFlowPosition, setNodes, currentLayer],
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
        nodeTypes={nodeTypes}
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
