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
      category:categories(name)
      `,
    )
    .eq("user_id", user.id);

  if (error) {
    throw new Error(`Failed to load user shaders: ${error.message}`);
  }

  return data ?? [];
}

export async function submitShaderRating(shaderId: string, rating: number) {
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
