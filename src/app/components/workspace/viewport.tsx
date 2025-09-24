import { useCallback } from "react";
import { ReactFlow, useReactFlow, Background } from "@xyflow/react";
import { ShaderNode, useNodeStore } from "@/store/store";
import { RenderShaderNode } from "./shader-node";
import { NodeData } from "@/schemas/node.schema";

const nodeTypes = {
  RenderShaderNode,
};

export function Viewport() {
  const layers = useNodeStore((s) => s.layers);
  const currentLayer = useNodeStore((s) => s.currentLayer);
  const storeNodeTypes = useNodeStore((s) => s.nodeTypes);
  const onNodesChange = useNodeStore((s) => s.onNodesChange);
  const onEdgesChange = useNodeStore((s) => s.onEdgesChange);
  const onConnect = useNodeStore((s) => s.onConnect);
  const addNode = useNodeStore((s) => s.addNode);

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
