import * as Y from "yjs";
import {
  Awareness,
  encodeAwarenessUpdate,
  applyAwarenessUpdate,
} from "y-protocols/awareness";
import { RealtimeChannel } from "@supabase/supabase-js";
import { ShaderNode } from "@/schemas/node.schema";
import { Edge } from "@xyflow/react";

export function initYjsSync(
  roomId: string,
  channel: RealtimeChannel,
  userInfo?: { name: string; avatar: string },
) {
  const ydoc = new Y.Doc();
  const yNodes = ydoc.getMap<ShaderNode>("nodes");
  const yEdges = ydoc.getMap<Edge>("edges");
  const yAssets = ydoc.getMap("assets");
  const awareness = new Awareness(ydoc);

  ydoc.on("update", (update: Uint8Array, origin: unknown) => {
    if (origin === channel) return;

    channel.send({
      type: "broadcast",
      event: "yjs-update",
      payload: { update: Array.from(update) },
    });
  });

  channel.on("broadcast", { event: "yjs-update" }, ({ payload }) => {
    Y.applyUpdate(ydoc, new Uint8Array(payload.update), channel);
  });

  awareness.on(
    "update",
    ({
      added,
      updated,
      removed,
    }: {
      added: number[];
      updated: number[];
      removed: number[];
    }) => {
      const changedClients = added.concat(updated).concat(removed);
      const update = encodeAwarenessUpdate(awareness, changedClients);

      channel.send({
        type: "broadcast",
        event: "awareness-update",
        payload: { update: Array.from(update) },
      });
    },
  );

  channel.on("broadcast", { event: "awareness-update" }, ({ payload }) => {
    if (payload.update) {
      applyAwarenessUpdate(awareness, new Uint8Array(payload.update), null);
    }
  });

  const hue = Math.floor(Math.random() * 360);
  const color = `hsl(${hue}, 70%, 60%)`;

  awareness.setLocalState({
    user: {
      name: userInfo?.name || "User",
      avatar: userInfo?.avatar || "",
      color,
    },
  });

  const heartbeat = setInterval(() => {
    awareness.setLocalState(awareness.getLocalState());
  }, 10000);

  ydoc.on("destroy", () => clearInterval(heartbeat));

  return { ydoc, yNodes, yEdges, yAssets, awareness };
}
