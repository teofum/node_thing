"use client";

import { ReactFlowProvider } from "@xyflow/react";

import { Sidebar } from "./sidebar";
import { Viewport } from "./viewport";

export function Workspace() {
  return (
    <>
      <ReactFlowProvider>
        <div className="w-full h-full flex gap-2 p-2 pr-0 flex-1 min-h-0">
          {/* Sidebar a la izquierda */}
          <Sidebar />

          {/* Canvas a la derecha */}
          <div className="flex-1 rounded overflow-hidden">
            <Viewport />
          </div>
        </div>
      </ReactFlowProvider>
    </>
  );
}
