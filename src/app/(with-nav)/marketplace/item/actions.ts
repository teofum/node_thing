"use server";

import { getSupabaseUserOrRedirect } from "@/lib/supabase/auth-util";
import camelcaseKeys from "camelcase-keys";

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

export async function getReviews(id: string, type: "shader" | "project") {
  const { supabase, user } = await getSupabaseUserOrRedirect(
    "/auth/login?next=/marketplace",
  );

  const { data, error } = await supabase
    .from("ratings")
    .select(
      `
      id,
      rating,
      comment,
      created_at,
      profiles(username)
    `,
    )
    .eq("item_type", type)
    .eq(`${type}_id`, id)
    .order("updated_at", { ascending: false });

  if (error) throw new Error(`Failed to retrieve reviews: ${error.message}`);

  return camelcaseKeys(data);
}
