"use client";

import { useState } from "react";
import { useProjectStore } from "@/store/project.store";

export function CollaborationToggle() {
  const [enabled, setEnabled] = useState(false);
  const toggleCollaboration = useProjectStore((s) => s.toggleCollaboration);

  const handleToggle = () => {
    const newState = !enabled;
    setEnabled(newState);
    toggleCollaboration(newState);
  };

  return (
    <button
      onClick={handleToggle}
      className="absolute top-2 right-2 z-50 px-3 py-1.5 rounded font-bold text-white text-sm"
      style={{ backgroundColor: enabled ? "#ff1493" : "#ff69b4" }}
    >
      {enabled ? "COLLAB ON" : "COLLAB OFF"}
    </button>
  );
}
