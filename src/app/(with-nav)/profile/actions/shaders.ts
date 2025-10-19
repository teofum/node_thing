"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PostgrestError } from "@supabase/supabase-js";
import camelcaseKeys from "camelcase-keys";

export async function getPublishedShaders() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/profile");
  }

  const { data, error } = await supabase
    .from("shaders")
    .select(
      `
      id,
      title,
      category:categories(name)
      `,
    )
    .eq("user_id", user.id)
    .eq("published", true);

  if (error) {
    throw new Error(`Failed to load published shaders: ${error.message}`);
  }

  return camelcaseKeys(data) ?? [];
}

export async function getPurchasedShaders() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/profile");
  }

  const errorMessage = (err: PostgrestError) => {
    return `Failed to load purchased shaders: ${err.message}`;
  };

  const { data: purchases, error: err1 } = await supabase
    .from("purchases")
    .select("shader_id")
    .eq("user_id", user.id);

  if (err1) throw new Error(errorMessage(err1));

  const shaderIds = purchases.map((p) => p.shader_id);

  const { data: shaders, error: err2 } = await supabase
    .from("shaders")
    .select("id, title, category:categories(name)")
    .in("id", shaderIds);

  if (err2) throw new Error(errorMessage(err2));

  return camelcaseKeys(shaders) ?? [];
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
