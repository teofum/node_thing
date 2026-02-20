"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import camelcaseKeys from "camelcase-keys";
import { getSupabaseUserOrRedirect } from "@/lib/supabase/auth-util";

export type UserData = {
  username: string;
  displayName: string | null;
  mpAccessToken?: string | null;
};

export async function getUser() {
  const { supabase, user } = await getSupabaseUserOrRedirect(
    "/auth/login?next=/profile",
  );

  return user;
}

export async function getUserData() {
  const { supabase, user } = await getSupabaseUserOrRedirect(
    "/auth/login?next=/profile",
  );

  const { data, error } = await supabase
    .from("profiles")
    .select("username, display_name, mp_access_token")
    .eq("id", user.id)
    .single();

  if (error) {
    throw new Error(`Failed to load user data: ${error.message}`);
  }

  const camelData = camelcaseKeys(data, { deep: true });

  return {
    ...camelData,
    displayName: camelData.displayName || user.user_metadata.full_name || null,
  };
}
