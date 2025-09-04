import { useCallback } from "react";
import {
  ReactFlow,
  Controls,
  useReactFlow,
  Background,
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
    onNodesChange,
    onEdgesChange,
    onConnect,
  } = useStore();

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
      const type = event.dataTransfer.getData("type") as NodeData["type"];
      const currId = `${type === "__input" || type === "__output" ? `${type}_` : ""}${getId()}`;

      // TODO esto hardcodeo, instancio siempre un ShaderNode con tipo interno "middle"
      const newNode: ShaderNode = {
        id: currId,
        type: "RenderShaderNode", // hardcodeo
        position,
        data: {
          type,
        },
      };

      setNodes([...useStore.getState().layers[currentLayer].nodes, newNode]);
    },
    [screenToFlowPosition, setNodes, currentLayer],
  );

  /*
   * Detect macOS and adjust controls to be more consistent with platform
   * conventions (use the touchpad)
   */
  const mac = navigator.platform.startsWith("Mac");

  return (
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
      defaultEdgeOptions={{
        style: { strokeWidth: 2, stroke: "#505050" },
      }}
      panOnScroll={mac}
      panOnDrag={!mac}
      selectionOnDrag={mac}
    >
      <Controls />
      <Background />
      <MiniMap />
    </ReactFlow>
  );
}
