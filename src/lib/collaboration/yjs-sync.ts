import * as Y from "yjs";
import { Awareness } from "y-protocols/awareness";
import { RealtimeChannel } from "@supabase/supabase-js";
import { ShaderNode } from "@/schemas/node.schema";
import { Edge } from "@xyflow/react";

interface AwarenessUserState {
  user?: {
    name: string;
    avatar: string;
    color: string;
  };
}

export function initYjsSync(
  roomId: string,
  channel: RealtimeChannel,
  userInfo?: { name: string; avatar: string },
) {
  const ydoc = new Y.Doc();
  const yNodes = ydoc.getMap<ShaderNode>("nodes");
  const yEdges = ydoc.getMap<Edge>("edges");
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
      const states: Record<number, AwarenessUserState> = {};
      changedClients.forEach((clientId) => {
        const state = awareness.getStates().get(clientId);
        if (state) {
          states[clientId] = state;
        }
      });

      channel.send({
        type: "broadcast",
        event: "awareness-update",
        payload: { states },
      });
    },
  );

  channel.on("broadcast", { event: "awareness-update" }, ({ payload }) => {
    if (payload.states) {
      const states = awareness.getStates();
      Object.entries(payload.states).forEach(([clientId, state]) => {
        states.set(Number(clientId), state as AwarenessUserState);
      });
      awareness.emit("change", [
        {
          added: [] as number[],
          updated: Object.keys(payload.states).map(Number),
          removed: [] as number[],
        },
      ]);
    }
  });

  awareness.setLocalState({
    user: {
      name: userInfo?.name || "User",
      avatar: userInfo?.avatar || "",
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
    },
  });

  return { ydoc, yNodes, yEdges, awareness };
}
