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

export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/profile");
  }

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
}

export async function removeAvatar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/profile");
  }

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
}
