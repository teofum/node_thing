"use server";

import { getSupabaseUserOrRedirect } from "@/lib/supabase/auth-util";
import camelcaseKeys from "camelcase-keys";
import { revalidatePath } from "next/cache";

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
  const { supabase } = await getSupabaseUserOrRedirect(
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

export async function uploadImageToBucket(
  file: File,
  itemType: "shader" | "project",
  itemId: string,
) {
  const { supabase } = await getSupabaseUserOrRedirect(
    "/auth/login?next=/marketplace",
  );

  const fileName = `${itemType}_${itemId}`;

  await supabase.storage.from("marketplace_images").remove([fileName]);

  // bucket
  const { error } = await supabase.storage
    .from("marketplace_images")
    .upload(fileName, file, {
      contentType: "",
      upsert: true,
    });

  if (error) throw new Error("Error uploading image: " + error.message);

  // reference
  const { error: tableError } = await supabase
    .from(`${itemType}s`)
    .update({
      image_name: fileName,
      updated_at: new Date().toISOString(),
    })
    .eq("id", itemId);

  if (tableError) {
    throw new Error(`Failed to save image: ${tableError.message}`);
  }

  revalidatePath(`/marketplace/${itemType}/${itemId}`);
}

export async function isOwner(itemType: "shader" | "project", itemId: string) {
  const { supabase, user } = await getSupabaseUserOrRedirect(
    "/auth/login?next=/marketplace",
  );

  const { data, error } = await supabase
    .from(`${itemType}s`)
    .select("user_id")
    .eq("id", itemId)
    .single();

  if (error) {
    throw new Error(`Failed to load user id: ${error.message}`);
  }

  if (!data) {
    return false;
  }

  return data.user_id === user.id;
}
