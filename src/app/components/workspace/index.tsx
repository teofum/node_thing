"use client";

import { ReactFlowProvider } from "@xyflow/react";
import { useEffect, useState } from "react";
import { useNodeStore } from "@/store/node.store";

import { Sidebar } from "./sidebar";
import { Viewport } from "./viewport";
import { useAssetStore } from "@/store/asset.store";

export function Workspace() {
  const loadNodeTypes = useNodeStore((state) => state.loadNodeTypes);

  useEffect(() => {
    loadNodeTypes();
  }, [loadNodeTypes]);

  const [storeHydrated, setStoreHydrated] = useState(false);
  useEffect(() => {
    useAssetStore.persist.rehydrate();
    setStoreHydrated(true);
  }, []);

  if (!storeHydrated) return null;

  return (
    <ReactFlowProvider>
      <div className="relative w-full h-full flex-1 min-h-0 rounded-2xl overflow-hidden border border-white/15">
        <Sidebar />

        <Viewport />
      </div>
    </ReactFlowProvider>
  );
}
