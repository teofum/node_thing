import { useCallback } from "react";
import { ReactFlow, useReactFlow, Background } from "@xyflow/react";
import { useProjectStore } from "@/store/project.store";
import { RenderShaderNode } from "./shader-node";
import { NodeData } from "@/schemas/node.schema";

const nodeTypes = {
  RenderShaderNode,
};

export function Viewport() {
  const layers = useProjectStore((s) => s.layers);
  const currentLayer = useProjectStore((s) => s.currentLayer);
  const storeNodeTypes = useProjectStore((s) => s.nodeTypes);
  const onNodesChange = useProjectStore((s) => s.onNodesChange);
  const onEdgesChange = useProjectStore((s) => s.onEdgesChange);
  const onConnect = useProjectStore((s) => s.onConnect);
  const addNode = useProjectStore((s) => s.addNode);

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

  // obtengo la capa actual para imprimir
  const { nodes, edges } = layers[currentLayer];

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
