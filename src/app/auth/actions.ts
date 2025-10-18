"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { Provider } from "@supabase/supabase-js";
import { getBaseUrl } from "@/lib/utils";

export async function signInAction(formData: FormData) {
  const supabase = await createClient();
  const emailOrUsername = formData.get("emailOrUsername") as string;
  const password = formData.get("password") as string;
  const next = formData.get("next") as string;

  let email = emailOrUsername;

  if (!emailOrUsername.includes("@")) {
    const { data: profileData } = await supabase.rpc(
      "get_user_email_by_username",
      { username_param: emailOrUsername },
    );

    if (!profileData) {
      const errorUrl = next
        ? `/auth/login?next=${encodeURIComponent(next)}&error=${encodeURIComponent("Invalid username or password")}`
        : `/auth/login?error=${encodeURIComponent("Invalid username or password")}`;
      redirect(errorUrl);
    }
    email = profileData;
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    const errorUrl = next
      ? `/auth/login?next=${encodeURIComponent(next)}&error=${encodeURIComponent(error.message)}`
      : `/auth/login?error=${encodeURIComponent(error.message)}`;
    redirect(errorUrl);
  }

  revalidatePath("/");

  // Only redirect to next if it's a valid path starting with /
  if (next && next.startsWith("/")) {
    redirect(next);
  } else {
    redirect("/");
  }
}

export async function signUpAction(formData: FormData) {
  const supabase = await createClient();
  const username = formData.get("username") as string;
  const email = formData.get("email") as string;
  const displayName = formData.get("displayName") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (password !== confirmPassword) {
    redirect(
      `/auth/signup?error=${encodeURIComponent("Passwords do not match")}`,
    );
  }

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("username")
    .eq("username", username)
    .single();

  if (existingProfile) {
    redirect(
      `/auth/signup?error=${encodeURIComponent("Username already taken")}`,
    );
  }

  // Generate default avatar URL using first letter of display name or username
  const firstLetter = (displayName || username || email)[0].toUpperCase();
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(firstLetter)}&background=14b8a6&color=ffffff&size=128`;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${await getBaseUrl()}/`,
      data: {
        username,
        full_name: displayName,
        avatar_url: avatarUrl,
      },
    },
  });

  if (error) {
    redirect(`/auth/signup?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/auth/sign-up-success");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/");
  redirect("/");
}

export async function forgotPasswordAction(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${await getBaseUrl()}/auth/callback?next=/auth/update-password`,
  });

  if (error) {
    redirect(
      `/auth/forgot-password?error=${encodeURIComponent(error.message)}`,
    );
  }

  redirect(
    `/auth/forgot-password?message=${encodeURIComponent("Check your email for the password reset link")}`,
  );
}

export async function updatePasswordAction(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    redirect(
      `/auth/login?error=${encodeURIComponent("Please log in to update your password")}`,
    );
  }

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (password !== confirmPassword) {
    redirect(
      `/auth/update-password?error=${encodeURIComponent("Passwords do not match")}`,
    );
  }

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    redirect(
      `/auth/update-password?error=${encodeURIComponent(error.message)}`,
    );
  }

  redirect(`/?message=${encodeURIComponent("Password updated successfully")}`);
}

export async function signInWithOAuthAction(
  formData: FormData,
  provider: Provider,
) {
  const supabase = await createClient();
  const next = formData.get("next") as string;

  const callbackUrl =
    next && next.startsWith("/")
      ? `${await getBaseUrl()}/auth/callback?next=${encodeURIComponent(next)}`
      : `${await getBaseUrl()}/auth/callback`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: callbackUrl,
    },
  });

  if (error) {
    redirect(`/auth/login?error=${encodeURIComponent(error.message)}`);
  }

  if (data.url) {
    redirect(data.url);
  }
}

export async function signInWithGoogleAction(formData: FormData) {
  return signInWithOAuthAction(formData, "google");
}

export async function signInWithGithubAction(formData: FormData) {
  return signInWithOAuthAction(formData, "github");
}

export async function signInWithDiscordAction(formData: FormData) {
  return signInWithOAuthAction(formData, "discord");
}

export async function onboardingAction(formData: FormData) {
  const supabase = await createClient();
  const username = formData.get("username") as string;
  const displayName = formData.get("displayName") as string;
  const next = formData.get("next") as string;

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect(`/auth/login?error=${encodeURIComponent("Please log in first")}`);
  }

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("username")
    .eq("username", username)
    .single();

  if (existingProfile) {
    const errorUrl = next
      ? `/onboarding?next=${encodeURIComponent(next)}&error=${encodeURIComponent("Username already taken")}`
      : `/onboarding?error=${encodeURIComponent("Username already taken")}`;
    redirect(errorUrl);
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .insert({ id: user.id, username });

  if (profileError) {
    const errorUrl = next
      ? `/onboarding?next=${encodeURIComponent(next)}&error=${encodeURIComponent(profileError.message || "Failed to create profile")}`
      : `/onboarding?error=${encodeURIComponent(profileError.message || "Failed to create profile")}`;
    redirect(errorUrl);
  }

  const { error: updateError } = await supabase.auth.updateUser({
    data: {
      full_name: displayName,
    },
  });

  if (updateError) {
    const errorUrl = next
      ? `/onboarding?next=${encodeURIComponent(next)}&error=${encodeURIComponent(updateError.message || "Failed to update display name")}`
      : `/onboarding?error=${encodeURIComponent(updateError.message || "Failed to update display name")}`;
    redirect(errorUrl);
  }

  revalidatePath("/");

  if (next && next.startsWith("/")) {
    redirect(next);
  } else {
    redirect("/");
  }
}
