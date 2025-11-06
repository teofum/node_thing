"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import camelcaseKeys from "camelcase-keys";
import { Replace } from "@/utils/replace";
import { getSupabaseUserOrRedirect } from "@/lib/supabase/auth-util";
import { revalidatePath } from "next/cache";

export async function getPublishedShaders() {
  const { supabase, user } = await getSupabaseUserOrRedirect(
    "/auth/login?next=/profile",
  );

  const { data, error } = await supabase.rpc("get_published_shaders", {
    user_uuid: user.id,
  });

  if (error) {
    throw new Error(`Failed to load published shaders: ${error.message}`);
  }

  return camelcaseKeys(
    data as Replace<
      (typeof data)[number],
      { category: { id: string; name: string } }
    >[],
  );
}

export async function getPurchasedShaders() {
  const { supabase, user } = await getSupabaseUserOrRedirect(
    "/auth/login?next=/profile",
  );

  const { data, error } = await supabase.rpc("get_purchased_shaders", {
    user_uuid: user.id,
  });

  if (error) {
    throw new Error(`Failed to load purchased shaders: ${error.message}`);
  }

  return camelcaseKeys(
    data as Replace<
      (typeof data)[number],
      { category: { id: string; name: string } }
    >[],
  );
}

export async function getPublishedProjects() {
  const { supabase, user } = await getSupabaseUserOrRedirect(
    "/auth/login?next=/profile",
  );

  const { data, error } = await supabase.rpc("get_published_projects", {
    user_uuid: user.id,
  });

  if (error) {
    throw new Error(`Failed to load published shaders: ${error.message}`);
  }

  return camelcaseKeys(data);
}

export async function getPurchasedProjects() {
  const { supabase, user } = await getSupabaseUserOrRedirect(
    "/auth/login?next=/profile",
  );

  const { data, error } = await supabase.rpc("get_purchased_projects", {
    user_uuid: user.id,
  });

  if (error) {
    throw new Error(`Failed to load purchased projects: ${error.message}`);
  }

  return camelcaseKeys(data);
}

export async function submitReview(
  type: "shader" | "project", // TODO group
  itemId: string,
  rating: number,
  comment: string,
) {
  const { supabase, user } = await getSupabaseUserOrRedirect(
    "/auth/login?next=/profile",
  );

  const itemType = type === "shader" ? "shader_id" : "project_id";

  const { error: upsertError } = await supabase.from("ratings").upsert(
    {
      [itemType]: itemId,
      user_id: user.id,
      rating,
      comment,
      item_type: type,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: `user_id, ${itemType}`,
    },
  );

  if (upsertError) {
    throw new Error(
      `Failed to upsert ${itemType} rating: ${upsertError.message}`,
    );
  }

  revalidatePath("/profile");
}

export async function deleteReview(type: "shader" | "project", itemId: string) {
  const { supabase, user } = await getSupabaseUserOrRedirect(
    "/auth/login?next=/profile",
  );

  const itemType = type === "shader" ? "shader_id" : "project_id";

  const { error } = await supabase
    .from("ratings")
    .delete()
    .eq(itemType, itemId)
    .eq("user_id", user.id)
    .eq("item_type", type);

  if (error) {
    throw new Error(`Failed to delete ${itemType} rating: ${error.message}`);
  }

  revalidatePath("/profile");
}

export async function getUserRatings(item: "shader_id" | "project_id") {
  const { supabase, user } = await getSupabaseUserOrRedirect(
    "/auth/login?next=/profile",
  );

  const { data, error } = await supabase
    .from("ratings")
    .select(`id, ${item}, rating, comment, updated_at`)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(`Failed to load user ratings: ${error.message}`);
  }

  return camelcaseKeys(data) ?? [];
}
