import { getSupabaseUserOrRedirect } from "@/lib/supabase/auth-util";
import { Tables } from "@/lib/supabase/database.types";
import { SupabaseClient, User } from "@supabase/supabase-js";

export async function getProjects() {
  const { supabase, user } = await getSupabaseUserOrRedirect("/onboarding");

  if ((await getUserData(supabase, user))?.is_premium === false) {
    return [];
  }

  let projects: Tables<"projects">[] = [];

  const { data: projectData, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (projectError) {
    throw new Error(`Failed to load projects: ${projectError.message}`);
  }

  projects = projectData ?? [];

  return projects;
}

export async function getPurchasedProjects() {
  const { supabase, user } = await getSupabaseUserOrRedirect("/onboarding");

  if ((await getUserData(supabase, user))?.is_premium === false) {
    return [];
  }

  let purchasedProjects: Tables<"projects">[] = [];

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

  purchasedProjects =
    (purchasedProjectData
      ?.map((p) => p.projects)
      .filter((p) => p !== null) as Tables<"projects">[]) ?? [];

  return purchasedProjects;
}

export async function getUserData(supabase: SupabaseClient, user: User) {
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
