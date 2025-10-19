"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import camelcaseKeys from "camelcase-keys";

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/profile");
  }

  return user;
}

export async function getUserData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/profile");
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("username, display_name, is_premium, cancelled, subscription_id")
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
