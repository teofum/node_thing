"use client";

import { ReactFlowProvider } from "@xyflow/react";

import { SidebarLibrary } from "./sidebar-library";
import { Viewport } from "./viewport";
import { SidebarLayers } from "./sidebar-layers";

export function Workspace() {
  return (
    <ReactFlowProvider>
      <div className="relative w-full h-full flex-1 min-h-0 rounded-2xl overflow-hidden border border-white/15">
        <SidebarLibrary />
        <SidebarLayers />

        <Viewport />
      </div>
    </ReactFlowProvider>
  );
}
