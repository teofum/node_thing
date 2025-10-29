"use server";

import { getSupabaseUserOrRedirect } from "@/lib/supabase/auth-util";

export async function getItem(id: string, type: "shader" | "project") {
  const { supabase, user } = await getSupabaseUserOrRedirect(
    "/auth/login?next=/marketplace",
  );

  const { data, error } = await supabase
    .rpc("get_item", { item_type: type, item_id: id, user_uuid: user.id })
    .single();

  if (error) throw new Error(`Failed to retrieve ${type}: ${error.message}`);

  return data;
}
