"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseUserOrRedirect } from "@/lib/supabase/auth-util";

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
    .ilike("username", username)
    .neq("id", user.id)
    .single();

  return !data;
}

export async function setUsername(username: string) {
  const { supabase, user } = await getSupabaseUserOrRedirect(
    "/auth/login?next=/profile",
  );

  const lowercaseUsername = username.toLowerCase().trim();

  if (!lowercaseUsername) {
    throw new Error("Username cannot be empty");
  }

  if (/\s/.test(lowercaseUsername)) {
    throw new Error("Username cannot contain spaces");
  }

  // Get current username to check if it's the same
  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  if (currentProfile?.username === lowercaseUsername) {
    throw new Error("Username is the same as current");
  }

  const isAvailable = await checkUsernameAvailable(lowercaseUsername);
  if (!isAvailable) {
    throw new Error("Username already taken");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ username: lowercaseUsername })
    .eq("id", user.id);

  if (error) {
    throw new Error(`Failed to update username: ${error.message}`);
  }

  redirect(`/profile/${lowercaseUsername}`);
}

export async function setDisplayName(displayName: string) {
  const { supabase, user } = await getSupabaseUserOrRedirect(
    "/auth/login?next=/profile",
  );

  const trimmedDisplayName = displayName.trim();

  if (!trimmedDisplayName) {
    throw new Error("Display name cannot be empty");
  }

  const { error } = await supabase.auth.updateUser({
    data: { full_name: trimmedDisplayName },
  });

  if (error) {
    throw new Error(`Failed to update display name: ${error.message}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  revalidatePath(`/profile/${profile?.username}`);
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
) {
  const { supabase, user } = await getSupabaseUserOrRedirect(
    "/auth/login?next=/profile",
  );

  if (!currentPassword || !newPassword) {
    throw new Error("Passwords cannot be empty");
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  revalidatePath(`/profile/${profile?.username}`);
}

export async function uploadAvatar(formData: FormData) {
  const { supabase, user } = await getSupabaseUserOrRedirect(
    "/auth/login?next=/profile",
  );

  const file = formData.get("avatar") as File;
  if (!file || file.size === 0) {
    throw new Error("No file provided");
  }

  const fileExt = file.name.split(".").pop();
  const filePath = `${user.id}/avatar-${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    throw new Error(`Failed to upload avatar: ${uploadError.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(filePath);

  const { error: updateError } = await supabase.auth.updateUser({
    data: { avatar_url: publicUrl },
  });

  if (updateError) {
    throw new Error(`Failed to update avatar URL: ${updateError.message}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  revalidatePath(`/profile/${profile?.username}`);
}

export async function removeAvatar() {
  const { supabase, user } = await getSupabaseUserOrRedirect(
    "/auth/login?next=/profile",
  );

  const firstLetter = (user.user_metadata.full_name ||
    user.user_metadata.username ||
    user.email)[0].toUpperCase();
  const defaultAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(firstLetter)}&background=14b8a6&color=ffffff&size=128`;

  const { error } = await supabase.auth.updateUser({
    data: { avatar_url: defaultAvatarUrl },
  });

  if (error) {
    throw new Error(`Failed to remove avatar: ${error.message}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  revalidatePath(`/profile/${profile?.username}`);
}
