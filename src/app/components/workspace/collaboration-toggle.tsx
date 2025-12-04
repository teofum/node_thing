"use client";

import { useEffect } from "react";
import { useProjectStore } from "@/store/project.store";
import { createRoom } from "@/lib/collaboration/actions";

export function CollaborationToggle() {
  const toggleCollaboration = useProjectStore((s) => s.toggleCollaboration);
  const currentRoomId = useProjectStore((s) => s.currentRoomId);
  const enabled = useProjectStore((s) => s.collaborationEnabled);

  // auto-join room from URL when someone opens a shared link
  // TODO: see if there's another way to do it
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomFromUrl = params.get("room");
    if (roomFromUrl && !currentRoomId && !enabled) {
      useProjectStore.setState({ currentRoomId: roomFromUrl });
      useProjectStore.getState().toggleCollaboration(true);
    }
  }, [currentRoomId, enabled]);

  const handleToggle = async () => {
    if (!currentRoomId && !enabled) {
      const result = await createRoom();
      if (result) {
        useProjectStore.setState({ currentRoomId: result.roomId });
        toggleCollaboration(true);
      }
    } else {
      toggleCollaboration(!enabled);
    }
  };

  const handleCopyLink = () => {
    if (currentRoomId) {
      const url = `${window.location.origin}?room=${currentRoomId}`;
      navigator.clipboard.writeText(url);
    }
  };

  return (
    <div className="absolute top-2 right-2 z-50 flex gap-2">
      {currentRoomId && (
        <button
          onClick={handleCopyLink}
          className="px-3 py-1.5 rounded font-bold text-white text-sm bg-green-500"
        >
          COPY LINK
        </button>
      )}
      <button
        onClick={handleToggle}
        className="px-3 py-1.5 rounded font-bold text-white text-sm"
        style={{ backgroundColor: enabled ? "#ff1493" : "#ff69b4" }}
      >
        {enabled ? "COLLAB ON" : "START COLLAB"}
      </button>
    </div>
  );
}
