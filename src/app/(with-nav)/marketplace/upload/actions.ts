"use server";

import { Tables } from "@/lib/supabase/database.types";
import { getSupabaseUserOrRedirect } from "@/lib/supabase/auth-util";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function getUserProjects() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/marketplace/upload");
  }

  let projects: Tables<"projects">[] = [];

  if (user) {
    const { data: data, error } = await supabase
      .from("profiles")
      .select("username, is_premium")
      .eq("id", user.id)
      .single();

    if (error) {
      throw new Error(`Failed to load user data: ${error.message}`);
    }

    if (data?.is_premium) {
      const { data: projectData } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });
      projects = projectData ?? [];
    }
  }

  return projects;
}

export async function publishShader(
  shaderId: string,
  price: number,
  description: string,
  categoryId: number,
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/marketplace/upload");
  }

  await supabase
    .from("shaders")
    .update({
      published: true,
      price,
      description,
      category_id: categoryId,
    })
    .eq("id", shaderId);

  revalidatePath("/marketplace/upload");
  revalidatePath("/marketplace");
}

export async function publishProject(
  projectID: string,
  price: number,
  description: string,
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/profile");
  }

  await supabase
    .from("projects")
    .update({
      published: true,
      price,
      description,
      downloads: 0,
    })
    .eq("id", projectID);

  revalidatePath("/marketplace/upload");
  revalidatePath("/marketplace");
}

export async function getCreatedShaders() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/marketplace/upload");
  }

  const { data, error } = await supabase
    .from("shaders")
    .select("*")
    .eq("user_id", user.id);

  if (error) {
    throw new Error(`Failed to load published shaders: ${error.message}`);
  }

  const shaders: Tables<"shaders">[] = data ?? [];
  return shaders;
}
