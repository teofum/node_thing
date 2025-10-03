"use server";

import { createClient } from "@/lib/supabase/server";
import { imageTypeSchema } from "@/schemas/asset.schema";
import { useAssetStore } from "@/store/asset.store";
import { useMainStore } from "@/store/main.store";
import { getImageType } from "@/utils/image";
import { zipImportProject } from "@/utils/zip";
import JSZip from "jszip";
import { redirect } from "next/navigation";

export async function saveProjectOnline(projectJSON: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/profile");
  }

  // creo nuevo JSZip
  const zip = new JSZip();

  // cargo el JSON del proyecto
  zip.file("project.json", projectJSON);

  // cargo los assets (imágenes)
  const imagesFolder = zip.folder("images");
  const images = useAssetStore.getState().images;
  if (imagesFolder !== null) {
    for (const [name, asset] of Object.entries(images)) {
      imagesFolder.file(name, asset.data);
    }
  }

  // genero el binario
  const blob = await zip.generateAsync({ type: "blob" });

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
