import { useCallback, useMemo, useState } from "react";
import { ReactFlow, useReactFlow, Background } from "@xyflow/react";
import { useProjectStore } from "@/store/project.store";
import { RenderShaderNode } from "./shader-node";
import { NodeData, NodeType } from "@/schemas/node.schema";
import {
  ContextMenu,
  ContextMenuItem,
  ContextSubmenu,
} from "@/ui/context-menu";
import { LuPlus } from "react-icons/lu";

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

  const [ctxMenuPosition, setCtxMenuPosition] = useState({ x: 0, y: 0 });
  const { screenToFlowPosition } = useReactFlow();

  const onContextMenu = (ev: React.MouseEvent) => {
    setCtxMenuPosition(screenToFlowPosition({ x: ev.clientX, y: ev.clientY }));
  };

  const nodeCategories = useMemo(() => {
    const categories: [string, [string, NodeType][]][] = [];
    for (const [key, type] of Object.entries(storeNodeTypes)) {
      if (key === "__output") continue;

      let category = categories.find(([name]) => name === type.category);
      if (!category) {
        category = [type.category, []];
        categories.push(category);
      }

      category[1].push([key, type]);
    }

    return categories;
  }, [storeNodeTypes]);

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

  const { nodes, edges } = layers[currentLayer];

  /*
   * Detect macOS and adjust controls to be more consistent with platform
   * conventions (use the touchpad)
   */
  const mac = navigator.platform.startsWith("Mac");

  return (
    <ContextMenu
      trigger={
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
          onContextMenu={onContextMenu}
          style={
            {
              "--xy-edge-stroke":
                "rgb(from var(--color-neutral-300) r g b / 0.4)",
              "--xy-edge-stroke-selected":
                "rgb(from var(--color-teal-400) r g b / 0.6)",
              "--xy-handle-background-color": "var(--color-neutral-100)",
              "--xy-handle-border-color": "var(--color-neutral-600)",
            } as Record<string, string>
          }
        >
          <Background />{" "}
        </ReactFlow>
      }
    >
      <ContextSubmenu icon={<LuPlus />} label="Add node">
        {nodeCategories.map(([name, types]) => (
          <ContextSubmenu key={name} label={name}>
            {types.map(([key, type]) => (
              <ContextMenuItem
                key={key}
                onClick={() => addNode(key, ctxMenuPosition, {})}
              >
                {type.name}
              </ContextMenuItem>
            ))}
          </ContextSubmenu>
        ))}
      </ContextSubmenu>
    </ContextMenu>
  );
}
