"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function checkUsernameAvailable(username: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const { data } = await supabase
    .from("profiles")
    .select("username")
    .eq("username", username)
    .neq("id", user.id)
    .single();

  return !data; // true if available, false if taken
}

export async function setUsername(newUsername: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/profile");
  }

  const isAvailable = await checkUsernameAvailable(newUsername);
  if (!isAvailable) {
    redirect("/profile?error=username_taken");
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({ username: newUsername })
    .eq("id", user.id);

  if (error) {
    throw new Error(`Failed to update username: ${error.message}`);
  }

  return data;
}

export async function setDisplayName(newDisplayName: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/profile");
  }

  const { error } = await supabase.auth.updateUser({
    data: { full_name: newDisplayName },
  });

  if (error) {
    throw new Error(`Failed to update display name: ${error.message}`);
  }
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/profile");
  }

  const { data: isValid, error: verifyError } = await supabase.rpc(
    "verify_user_password",
    { password: currentPassword },
  );

  if (verifyError) {
    throw new Error(`Failed to verify password: ${verifyError.message}`);
  }

  if (!isValid) {
    throw new Error("Current password is incorrect");
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    throw new Error(`Failed to change password: ${error.message}`);
  }
}
