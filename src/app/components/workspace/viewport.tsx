import { useCallback } from "react";
import { ReactFlow, useReactFlow, Background } from "@xyflow/react";
import { useMainStore } from "@/store/main.store";
import { RenderShaderNode } from "./shader-node";
import { NodeData } from "@/schemas/node.schema";

const nodeTypes = {
  RenderShaderNode,
};

export function Viewport() {
  const layers = useMainStore((s) => s.layers);
  const currentLayer = useMainStore((s) => s.currentLayer);
  const storeNodeTypes = useMainStore((s) => s.nodeTypes);
  const onNodesChange = useMainStore((s) => s.onNodesChange);
  const onEdgesChange = useMainStore((s) => s.onEdgesChange);
  const onConnect = useMainStore((s) => s.onConnect);
  const addNode = useMainStore((s) => s.addNode);

  const { screenToFlowPosition } = useReactFlow();

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

      const type = event.dataTransfer.getData("type") as NodeData["type"];

      const parameters: NodeData["parameters"] = {};
      for (const key in storeNodeTypes[type].parameters) {
        const value = event.dataTransfer.getData(`params.${key}`) || null;

        parameters[key] = { value };
      }

      addNode(type, position, parameters);
    },
    [screenToFlowPosition, addNode, storeNodeTypes],
  );

  // agrego esto por removeLayer(), se usaba un currentLayer anterior y no se actualizaba
  const layer = layers[currentLayer]; // currentLayer = -1 si no apunta a ninguno
  if (!layer) {
    return null;
  }

  // obtengo la capa actual para imprimir
  const { nodes, edges } = layer;

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
      panOnScroll={mac}
      panOnDrag={!mac}
      selectionOnDrag={mac}
      style={
        {
          "--xy-edge-stroke": "rgb(from var(--color-neutral-300) r g b / 0.4)",
          "--xy-edge-stroke-selected":
            "rgb(from var(--color-teal-400) r g b / 0.6)",
          "--xy-handle-background-color": "var(--color-neutral-100)",
          "--xy-handle-border-color": "var(--color-neutral-600)",
        } as Record<string, string>
      }
    >
      <Background />
    </ReactFlow>
  );
}
