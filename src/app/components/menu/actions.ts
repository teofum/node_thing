"use server";

import { getSupabaseUserOrRedirect } from "@/lib/supabase/auth-util";
import { revalidatePath } from "next/cache";

export async function saveProjectOnline(blob: Blob) {
  const { supabase, user } = await getSupabaseUserOrRedirect(
    "/auth/login?next=/profile",
  );

  // subo proyecto al bucket en Supabase
  const fileName = `${user.id}_${Date.now()}`;
  const { error: uploadError } = await supabase.storage
    .from("user_projects")
    .upload(fileName, blob, {
      contentType: "application/zip",
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Failed to upload ZIP: ${uploadError.message}`);
  }

  // guardo referncia al proyecto en el bucket en la tabla projects
  const { error: tableError } = await supabase.from("projects").insert({
    user_id: user.id,
    name: fileName,
    updated_at: new Date().toISOString(),
    user_project: fileName,
  });

  if (tableError) {
    throw new Error(`Failed to save project: ${tableError.message}`);
  }

  revalidatePath("/");
}

export async function loadProjectOnline(user_project: string | null) {
  if (user_project === null) {
    throw new Error("User project name is null");
  }

  const { supabase } = await getSupabaseUserOrRedirect(
    "/auth/login?next=/profile",
  );

  // descargo zip del proyecto del bucket
  const { data: fileBlob, error: downloadError } = await supabase.storage
    .from("user_projects")
    .download(user_project);

  if (downloadError || fileBlob === null) {
    throw new Error(`Failed to download project: ${downloadError?.message}`);
  }

  return fileBlob;
}

export async function updateProjectName(projectId: string, newName: string) {
  const { supabase } = await getSupabaseUserOrRedirect("/");

  const { error } = await supabase
    .from("projects")
    .update({
      name: newName,
      updated_at: new Date().toISOString(),
    })
    .eq("id", projectId);

  if (error) throw new Error(`Rename failed: ${error.message}`);

  revalidatePath("/");
}

export async function deleteProject(projectId: string) {
  const { supabase } = await getSupabaseUserOrRedirect("/");

  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId);

  if (error) throw new Error(`Delete failed: ${error.message}`);

  revalidatePath("/");
}
