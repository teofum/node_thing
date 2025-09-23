"use client";

import { ReactFlowProvider } from "@xyflow/react";
import { useEffect } from "react";
import { useStore } from "@/store/store";

import { Sidebar } from "./sidebar";
import { Viewport } from "./viewport";

export function Workspace() {
  const loadNodeTypes = useStore((state) => state.loadNodeTypes);

  useEffect(() => {
    loadNodeTypes();
  }, [loadNodeTypes]);

  return (
    <ReactFlowProvider>
      <div className="relative w-full h-full flex-1 min-h-0 rounded-2xl overflow-hidden border border-white/15">
        <Sidebar />

        <Viewport />
      </div>
    </ReactFlowProvider>
  );
}
