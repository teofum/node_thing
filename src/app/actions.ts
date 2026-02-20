"use server";

import { getSupabaseUserOrRedirect } from "@/lib/supabase/auth-util";
import { Tables } from "@/lib/supabase/database.types";
import { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export async function getProjects() {
  const { supabase, user } = await getSupabaseUserOrRedirect("/onboarding");

  const { data: projectData, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (projectError) {
    throw new Error(`Failed to load projects: ${projectError.message}`);
  }

  const projects: Tables<"projects">[] = projectData ?? [];

  return projects;
}

export async function getPurchasedShaders() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data: purchases } = await supabase
    .from("purchases")
    .select(
      `
      shader:shaders (
        id,
        title,
        code,
        node_config,
        category:categories(name)
      )
    `,
    )
    .eq("user_id", user.id)
    .not("shader_id", "is", null);

  return purchases?.map((p) => p.shader).filter(Boolean) || [];
}

export async function getPurchasedProjects() {
  const { supabase, user } = await getSupabaseUserOrRedirect("/onboarding");

  const { data: purchasedProjectData, error: purchasedProjectError } =
    await supabase
      .from("purchases")
      .select(
        `
        project_id,
        projects(*)
    `,
      )
      .eq("user_id", user.id)
      .not("project_id", "is", null)
      .order("purchased_at", { ascending: false });

  if (purchasedProjectError) {
    throw new Error(
      `Failed to load purchased projects: ${purchasedProjectError.message}`,
    );
  }

  const purchasedProjects =
    (purchasedProjectData
      ?.map((p) => p.projects)
      .filter((p) => p !== null) as Tables<"projects">[]) ?? [];

  return purchasedProjects;
}

export async function getUserData(supabase: SupabaseClient, user: User) {
  const { data, error } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  if (error) {
    throw new Error(`Failed to load user data: ${error.message}`);
  }

  return data;
}

export async function loadTutorialProgress() {
  const { supabase, user } = await getSupabaseUserOrRedirect("/");

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("tutorials")
    .select("progress")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load tutorials: ${error.message}`);
  }

  return data ? (data.progress as Record<string, number>) : null;
}
