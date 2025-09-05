"use client";

import { ReactFlowProvider } from "@xyflow/react";

import { Sidebar } from "./sidebar";
import { Viewport } from "./viewport";

export function Workspace() {
  return (
    <>
      <ReactFlowProvider>
        <div className="relative w-full h-full flex-1 min-h-0">
          <Viewport />

          <Sidebar />
        </div>
      </ReactFlowProvider>
    </>
  );
}
