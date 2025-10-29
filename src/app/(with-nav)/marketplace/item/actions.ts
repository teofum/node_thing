"use server";

import { getSupabaseUserOrRedirect } from "@/lib/supabase/auth-util";

export async function getItem(id: string, type: "shader" | "project") {
  const { supabase } = await getSupabaseUserOrRedirect(
    "/auth/login?next=/marketplace",
  );

  const dbType = type === "shader" ? "shaders" : "projects";

  const { data, error } = await supabase.from(dbType).select("*").eq("id", id);

  if (error) {
    throw new Error(`Failted to retrieve shader: ${error.message}`);
  }

  return data;
}
