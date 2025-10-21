"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import camelcaseKeys from "camelcase-keys";
import { Replace } from "@/utils/replace";

export async function getPublishedShaders() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/profile");
  }

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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/profile");
  }

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

export async function submitShaderReview(
  shaderId: string,
  rating: number,
  comment: string,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/profile");
  }

  const { error: upsertError } = await supabase.from("ratings").upsert(
    {
      shader_id: shaderId,
      user_id: user.id,
      rating,
      comment,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id, shader_id",
    },
  );

  if (upsertError) {
    throw new Error(`Failed to upsert rating: ${upsertError.message}`);
  }
}

export async function deleteShaderReview(shaderId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/profile");
  }

  const { error } = await supabase
    .from("ratings")
    .delete()
    .eq("shader_id", shaderId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(`Failed to delete rating: ${error.message}`);
  }
}

export async function getUserRatings() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/profile");
  }

  const { data, error } = await supabase
    .from("ratings")
    .select("id, shader_id, rating, comment, updated_at")
    .eq("user_id", user.id);

  if (error) {
    throw new Error(`Failed to load user ratings: ${error.message}`);
  }

  return camelcaseKeys(data) ?? [];
}
