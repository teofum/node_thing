import { Background, ReactFlow, useReactFlow } from "@xyflow/react";
import { useCallback, useMemo, useState } from "react";
import { LuPlus } from "react-icons/lu";

import { NodeData, NodeType } from "@/schemas/node.schema";
import { useProjectStore } from "@/store/project.store";
import { Graph, isGroup } from "@/store/project.types";
import {
  ContextMenu,
  ContextMenuItem,
  ContextSubmenu,
} from "@/ui/context-menu";
import { useNodeTypes } from "@/utils/use-node-types";
import { RenderGroupNode } from "./group-node";
import { RenderShaderNode } from "./shader-node";

const nodeTypes = {
  RenderShaderNode,
  RenderGroupNode,
};

export function Viewport() {
  const layers = useProjectStore((s) => s.layers);
  const currentLayer = useProjectStore((s) => s.currentLayer);
  const currentGroup = useProjectStore((s) => s.currentGroup);

  const storeNodeTypes = useNodeTypes();
  const onNodesChange = useProjectStore((s) => s.onNodesChange);
  const onEdgesChange = useProjectStore((s) => s.onEdgesChange);
  const onConnect = useProjectStore((s) => s.onConnect);
  const addNode = useProjectStore((s) => s.addNode);
  const awareness = useProjectStore((s) => s.awareness);
  const addGroup = useProjectStore((s) => s.addGroup);

  const [ctxMenuPosition, setCtxMenuPosition] = useState({ x: 0, y: 0 });
  const { screenToFlowPosition } = useReactFlow();

  const onContextMenu = (ev: React.MouseEvent) => {
    setCtxMenuPosition(screenToFlowPosition({ x: ev.clientX, y: ev.clientY }));
  };

  const handleNodesChange = useCallback(
    (changes: Parameters<typeof onNodesChange>[0]) => {
      onNodesChange(changes);

      if (awareness) {
        const selectedNode = changes.find(
          (c) => c.type === "select" && c.selected,
        );
        if (selectedNode && "id" in selectedNode) {
          awareness.setLocalStateField("selectedNode", selectedNode.id);
        } else if (changes.some((c) => c.type === "select" && !c.selected)) {
          awareness.setLocalStateField("selectedNode", null);
        }
      }
    },
    [onNodesChange, awareness],
  );

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

  let currentGraph: Graph = layers[currentLayer];
  for (const groupId of currentGroup) {
    const group = currentGraph.nodes
      .filter(isGroup)
      .find((n) => n.id === groupId);

    if (!group) break;
    currentGraph = group.data;
  }
  const { nodes, edges } = currentGraph;

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
          onNodesChange={handleNodesChange}
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
          <Background />
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

      <ContextMenuItem onClick={() => addGroup(ctxMenuPosition)}>
        New group
      </ContextMenuItem>
    </ContextMenu>
  );
}
