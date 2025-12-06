"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getUserData } from "./user";

export async function deletePublication(id: string, type: string) {
  const supabase = await createClient();

  const table = type === "shader" ? "shaders" : "projects";

  const { error } = await supabase.from(table).delete().eq("id", id);

  if (error) throw error;

  const { username } = await getUserData();

  redirect(`/profile/${username}`);
}
