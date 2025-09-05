"use client";

import { ReactFlowProvider } from "@xyflow/react";

import { Sidebar } from "./sidebar";
import { Viewport } from "./viewport";
import { useState } from "react";

export function Workspace() {
  const [hideSidebar, setHideSidebar] = useState(false);

  return (
    <>
      <ReactFlowProvider>
        <div className="relative w-full h-full flex-1 min-h-0">
          <Viewport />

          <Sidebar hideSidebar={hideSidebar} setHideSidebar={setHideSidebar} />
        </div>
      </ReactFlowProvider>
    </>
  );
}
