"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// export async function getUserData() {
//   const supabase = await createClient();
//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   if (!user) {
//     return null;
//   }

//   const { data, error } = await supabase
//     .from("profiles")
//     .select("username, is_premium")
//     .eq("id", user.id)
//     .single();

//   if (error) {
//     throw new Error(`Failed to load user data: ${error.message}`);
//   }

//   return data ?? { is_premium: false };
// }

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

// export async function getUserProjects() {
//   const supabase = await createClient();
//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   if (!user) {
//     redirect("/auth/login?next=/profile");
//   }

//   const { data, error } = await supabase
//     .from("projects")
//     .select("id, data, created_at")
//     .eq("user_id", user.id)

//   if (error) {
//     throw new Error(`Failed to load projects: ${error.message}`);
//   }

//   return data;
// }
