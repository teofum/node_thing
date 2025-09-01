"use client";

import { useStore } from "@/store/store";
import { buildRenderPipeline } from "./components/renderer/pipeline";

export function Tester() {
  const layer = useStore((store) => store.layers[0]);

  return (
    <div>
      <button
        className="bg-red-700 rounded-lg p-2"
        onClick={() => console.log(buildRenderPipeline(layer))}
      >
        test
      </button>
    </div>
  );
}
