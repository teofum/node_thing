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
    .eq("id", user.id);

  if (error) {
    throw new Error(`Failed to load user shaders: ${error.message}`);
  }

  return data ?? [];
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

  const { data: ratingExists, error: fetchError } = await supabase
    .from("ratings")
    .select("*")
    .eq("shader_id", shaderId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchError) {
    throw new Error(`Failed to fetch rating: ${fetchError.message}`);
  }

  // actualizo rating si ya existía
  if (ratingExists) {
    const { error: updateError } = await supabase
      .from("ratings")
      .update({ rating }) // TODO tal vez tenga que acutalizar .updated_at acá
      .eq("id", ratingExists.id);

    if (updateError) {
      throw new Error(`Failed to update rating: ${updateError.message}`);
    }
  }
  // de lo contrario, es inserción
  else {
    const { error: insertError } = await supabase.from("ratings").insert({
      shader_id: shaderId,
      user_id: user.id,
      rating,
    });

    if (insertError) {
      throw new Error(`Failed to insert rating: ${insertError.message}`);
    }
  }

  // actualizo average_rating y rating_count de tabla shaders
  const { data: shader, error: shaderError } = await supabase
    .from("shaders")
    .select("average_rating, rating_count")
    .eq("id", shaderId)
    .single();

  if (shaderError || !shader) {
    throw new Error(`Failed to get shader: ${shaderError.message}`);
  }

  let newCount = shader.rating_count ?? 0;
  let newAverage = shader.average_rating ?? 0;

  if (ratingExists) {
    newAverage =
      (newAverage * newCount - ratingExists.rating! + rating) / newCount;
  } else {
    newCount += 1;
    newAverage = (newAverage * (newCount - 1) + rating) / newCount;
  }

  // cargo nuevos valores de average_rating y rating_count
  const { error: shaderUpdateError } = await supabase
    .from("shaders")
    .update({
      rating_count: newCount,
      average_rating: newAverage,
    })
    .eq("id", shaderId);

  if (shaderUpdateError) {
    throw new Error(
      `Failed to update shader stats: ${shaderUpdateError.message}`,
    );
  }
}
