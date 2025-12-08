"use client";

import { useEffect, useState } from "react";
import { LuShare2, LuUsers } from "react-icons/lu";
import { useProjectStore } from "@/store/project.store";
import { createRoom } from "@/lib/collaboration/actions";
import { createClient } from "@/lib/supabase/client";

export function ShareButton() {
  const [user, setUser] = useState<{ id: string } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);
  const toggleCollaboration = useProjectStore((s) => s.toggleCollaboration);
  const currentRoomId = useProjectStore((s) => s.currentRoomId);
  const enabled = useProjectStore((s) => s.collaborationEnabled);
  const connectedUsers = useProjectStore((s) => s.connectedUsers);
  const [showPopover, setShowPopover] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomFromUrl = params.get("room");
    if (roomFromUrl && !currentRoomId && !enabled) {
      useProjectStore.setState({ currentRoomId: roomFromUrl });
      useProjectStore.getState().toggleCollaboration(true);
    }
  }, [currentRoomId, enabled]);

  const handleShare = async () => {
    if (!currentRoomId && !enabled) {
      const result = await createRoom();
      if (result) {
        useProjectStore.setState({ currentRoomId: result.roomId });
        await toggleCollaboration(true);
        setShowPopover(true);
      }
    } else {
      setShowPopover(!showPopover);
    }
  };

  const handleCopyLink = () => {
    if (currentRoomId) {
      const url = `${window.location.origin}?room=${currentRoomId}`;
      navigator.clipboard.writeText(url);
      setShowPopover(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex items-center gap-2">
      {connectedUsers.length > 0 && (
        <div className="flex -space-x-2">
          {connectedUsers.slice(0, 3).map((user) => (
            <div
              key={user.id}
              className="w-8 h-8 rounded-full border-2 border-neutral-950 overflow-hidden"
              style={{ backgroundColor: user.color }}
              title={user.name}
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          ))}
          {connectedUsers.length > 3 && (
            <div className="w-8 h-8 rounded-full border-2 border-neutral-950 bg-neutral-800 flex items-center justify-center text-white text-xs font-bold">
              +{connectedUsers.length - 3}
            </div>
          )}
        </div>
      )}

      <div className="relative">
        <button
          onClick={handleShare}
          className="px-3 py-1.5 rounded-md border border-white/15 hover:bg-white/5 transition-colors text-sm font-medium flex items-center gap-2 cursor-pointer"
        >
          <LuShare2 size={16} />
          Share
        </button>

        {showPopover && currentRoomId && (
          <div className="absolute top-full right-0 mt-2 w-64 bg-neutral-900 border border-white/15 rounded-lg shadow-lg p-4 z-50">
            <div className="flex items-center gap-2 mb-3">
              <LuUsers size={16} className="text-white/60" />
              <span className="text-sm text-white/60">
                {connectedUsers.length} connected
              </span>
            </div>
            <button
              onClick={handleCopyLink}
              className="w-full px-3 py-2 rounded bg-green-500 hover:bg-green-600 text-white text-sm font-bold cursor-pointer"
            >
              Copy Link
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
