"use server";

import { createClient } from "@/lib/supabase/server";

export async function createRoom() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: room, error: roomError } = await supabase
    .from("collaboration_rooms")
    .insert({
      created_by: user.id,
    })
    .select("id")
    .single();

  if (roomError || !room) return null;

  const { data: token, error: tokenError } = await supabase
    .from("room_access_tokens")
    .insert({
      room_id: room.id,
      permission: "write",
    })
    .select("token")
    .single();

  if (tokenError || !token) return null;

  return { roomId: room.id, token: token.token };
}
