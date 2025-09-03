"use client";

import {
  ReactFlow,
  type FitViewOptions,
  type OnNodeDrag,
  type DefaultEdgeOptions,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { RenderShaderNode } from "./renderShaderNode";
import { ReactFlowProvider } from "@xyflow/react";
import { Sidebar } from "./sidebar";
import { ReactFlowWithDnD } from "./reactFlowWithDnD";

const nodeTypes = {
  RenderShaderNode,
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

export function Workspace() {
  return (
    <>
      <ReactFlowProvider>
        <div className="w-full h-full flex min-h-0">
          {/* Sidebar a la izquierda */}
          <Sidebar />

          {/* Canvas a la derecha */}
          <div className="flex-1">
            <ReactFlowWithDnD />
          </div>
        </div>
      </ReactFlowProvider>
    </>
  );
}
