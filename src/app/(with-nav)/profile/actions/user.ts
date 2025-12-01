"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import camelcaseKeys from "camelcase-keys";
import { getSupabaseUserOrRedirect } from "@/lib/supabase/auth-util";

export type UserData = {
  username: string;
  displayName: string | null;
  isPremium: boolean | null;
  mpAccessToken?: string | null;
  cancelled?: boolean | null;
  subscriptionId?: string | null;
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
    .select(
      "username, display_name, is_premium, mp_access_token, cancelled, subscription_id",
    )
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
