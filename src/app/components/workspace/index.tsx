"use client";

import { useEffect, useState } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { LuX } from "react-icons/lu";

import { useProjectStore } from "@/store/project.store";
import { useAssetStore } from "@/store/asset.store";
import { Button } from "@/ui/button";
import { Sidebar } from "./sidebar";
import { Viewport } from "./viewport";

export function Workspace() {
  const loadNodeTypes = useProjectStore((state) => state.loadNodeTypes);
  const currentGroup = useProjectStore((s) => s.currentGroup);
  const closeGroup = useProjectStore((s) => s.closeGroup);

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
      <div className="flex flex-col w-full h-full flex-1 min-h-0 gap-2">
        {currentGroup.length ? (
          <div className="flex flex-row gap-2 items-center">
            <div className="text-xs/3">groups: {currentGroup.join("/")}</div>
            <Button
              size="sm"
              variant="outline"
              onClick={closeGroup}
              className="ml-auto"
            >
              <LuX /> Exit
            </Button>
          </div>
        ) : null}

        <div className="relative w-full h-full flex-1 min-h-0 rounded-2xl overflow-hidden border border-white/15">
          <Sidebar />
          <Viewport />
        </div>
      </div>
    </ReactFlowProvider>
  );
}
