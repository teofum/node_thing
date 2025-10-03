"use server";

import { createClient } from "@/lib/supabase/server";
import { zipImportProject } from "@/utils/zip";
import { redirect } from "next/navigation";

export async function saveProjectOnline(blob: Blob) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/profile");
  }

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
}

export async function loadProjectOnline(userProjectPath: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/profile");
  }

  // descargo zip del proyecto del bucket
  const { data, error } = await supabase.storage
    .from("user_projects")
    .download(userProjectPath);

  if (error || data === null) {
    throw new Error(`Failed to download project: ${error?.message}`);
  }

  const arrayBuffer = await data.arrayBuffer();
  const file = new File([arrayBuffer], "project.zip", {
    type: "application/zip",
  });

  await zipImportProject(file);
}

export async function updateProjectName(projectId: string, newName: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("projects")
    .update({
      name: newName,
      updated_at: new Date().toISOString(),
    })
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
