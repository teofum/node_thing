"use client";

import { useEffect, useState } from "react";
import { ReactFlowProvider } from "@xyflow/react";

import { useProjectStore } from "@/store/project.store";
import { useAssetStore } from "@/store/asset.store";
import { Sidebar } from "./sidebar";
import { Viewport } from "./viewport";

export function Workspace() {
  const loadNodeTypes = useProjectStore((state) => state.loadNodeTypes);

  useEffect(() => {
    loadNodeTypes();
  }, [loadNodeTypes]);

  const [storeHydrated, setStoreHydrated] = useState(false);
  useEffect(() => {
    useAssetStore.persist.onFinishHydration(() => {
      setStoreHydrated(true);
    });
    useAssetStore.persist.rehydrate();

    setStoreHydrated(useAssetStore.persist.hasHydrated());
  }, []);

  if (!storeHydrated)
    return (
      <div className="relative w-full h-full flex-1 grid place-items-center rounded-2xl border border-white/15 bg-neutral-950">
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
