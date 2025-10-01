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
