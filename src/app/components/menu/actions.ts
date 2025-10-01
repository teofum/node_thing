"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function saveProjectOnline(projectJSON: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/profile");
  }

  const { data, error } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      data: projectJSON,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save project: ${error.message}`);
  }

  return data;
}

export async function updateProjectName(projectId: string, newName: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("projects")
    .update({ name: newName })
    .eq("id", projectId);

  if (error) throw new Error(`Rename failed: ${error.message}`);
}

export async function deleteProject(projectId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId);

  if (error) throw new Error(`Delete failed: ${error.message}`);
}
