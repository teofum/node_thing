"use server";

import { createClient } from "@/lib/supabase/server";
import camelcaseKeys from "camelcase-keys";
import { Replace } from "@/utils/replace";

export async function getPublicUserData(username: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, is_premium")
    .eq("username", username)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

export async function getPublicPublishedShaders(username: string) {
  const supabase = await createClient();

  const userData = await getPublicUserData(username);
  if (!userData) return [];

  const { data, error } = await supabase.rpc("get_published_shaders", {
    user_uuid: userData.id,
  });

  if (error) {
    throw new Error(`Failed to load published shaders: ${error.message}`);
  }

  return camelcaseKeys(
    data as Replace<
      (typeof data)[number],
      { category: { id: string; name: string } }
    >[],
  );
}

export async function getPublicPublishedProjects(username: string) {
  const supabase = await createClient();

  const userData = await getPublicUserData(username);
  if (!userData) return [];

  const { data, error } = await supabase.rpc("get_published_projects", {
    user_uuid: userData.id,
  });

  if (error) {
    throw new Error(`Failed to load published projects: ${error.message}`);
  }

  return camelcaseKeys(data);
}
