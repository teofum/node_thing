"use client";

import { ReactFlowProvider } from "@xyflow/react";
import { useEffect, useState } from "react";
import { useMainStore } from "@/store/main.store";

import { Sidebar } from "./sidebar";
import { Viewport } from "./viewport";
import { useAssetStore } from "@/store/asset.store";

export function Workspace() {
  const loadNodeTypes = useMainStore((state) => state.loadNodeTypes);

  useEffect(() => {
    loadNodeTypes();
  }, [loadNodeTypes]);

  const [storeHydrated, setStoreHydrated] = useState(false);
  useEffect(() => {
    useAssetStore.persist.rehydrate();
    setStoreHydrated(true);
  }, []);

  if (!storeHydrated)
    return (
      <div className="relative w-full h-full flex-1 grid place-items-center rounded-2xl border border-white/15 bg-neutral-900">
        <div className="font-semibold text-lg">Loading...</div>
      </div>
    );

  return (
    <ReactFlowProvider>
      <div className="relative w-full h-full flex-1 min-h-0 rounded-2xl overflow-hidden border border-white/15">
        <Sidebar />

        <Viewport />
      </div>
    </ReactFlowProvider>
  );
}
