import * as Y from "yjs";
import { RealtimeChannel } from "@supabase/supabase-js";
import { ShaderNode } from "@/schemas/node.schema";
import { Edge } from "@xyflow/react";

export function initYjsSync(projectId: string, channel: RealtimeChannel) {
  const ydoc = new Y.Doc();
  const yNodes = ydoc.getArray<ShaderNode>("nodes");
  const yEdges = ydoc.getArray<Edge>("edges");

  // Send updates to other clients
  ydoc.on("update", (update: Uint8Array) => {
    channel.send({
      type: "broadcast",
      event: "yjs-update",
      payload: { update: Array.from(update) },
    });
  });

  // Receive updates from other clients
  channel.on("broadcast", { event: "yjs-update" }, ({ payload }) => {
    Y.applyUpdate(ydoc, new Uint8Array(payload.update));
  });

  return { ydoc, yNodes, yEdges };
}
