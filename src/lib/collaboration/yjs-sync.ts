import * as Y from "yjs";
import { RealtimeChannel } from "@supabase/supabase-js";
import { ShaderNode } from "@/schemas/node.schema";
import { Edge } from "@xyflow/react";

export function initYjsSync(roomId: string, channel: RealtimeChannel) {
  const ydoc = new Y.Doc();
  const yNodes = ydoc.getMap<ShaderNode>("nodes");
  const yEdges = ydoc.getMap<Edge>("edges");

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

  return { ydoc, yNodes, yEdges };
}
