"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/profile");
  }

  return user;
}

export async function getUserData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/profile");
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("username, is_premium")
    .eq("id", user.id)
    .single();

  if (error) {
    throw new Error(`Failed to load user data: ${error.message}`);
  }

  return data;
}

export async function getUserShaders() {
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
      average_rating,
      category:categories(name),
      rating_count
      `,
    )
    .eq("user_id", user.id);

  if (error) {
    throw new Error(`Failed to load user shaders: ${error.message}`);
  }

  return data ?? [];
}

export async function getPurchasedShaders() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/profile");
  }

  const { data: purchases, error: err1 } = await supabase
    .from("purchases")
    .select("shader_id")
    .eq("user_id", user.id);

  if (err1) throw err1;

  const shaderIds = purchases.map((p) => p.shader_id);

  const { data: shaders, error: err2 } = await supabase
    .from("shaders")
    .select(
      "id, title, average_rating, category:categories(name), rating_count",
    )
    .in("id", shaderIds);

  if (err2) throw err2;

  return shaders ?? [];
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

  // average_rating y rating_count se actualizan solos con triggers (ver Supabase)
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

  return data ?? [];
}

// TODO agregar eliminar ratings

export async function setUsername(newUsername: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/profile");
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({ username: newUsername })
    .eq("id", user.id);

  if (error) {
    throw new Error(`Failed to update username: ${error.message}`);
  }

  return data;
}
