"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

async function getBaseUrl() {
  const host = (await headers()).get("host");
  const protocol = host?.includes("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}

export async function signInAction(formData: FormData) {
  const supabase = await createClient();
  const emailOrUsername = formData.get("emailOrUsername") as string;
  const password = formData.get("password") as string;

  let email = emailOrUsername;

  if (!emailOrUsername.includes("@")) {
    const { data: profileData } = await supabase.rpc(
      "get_user_email_by_username",
      { username_param: emailOrUsername },
    );

    if (!profileData) {
      redirect(
        `/auth/login?error=${encodeURIComponent("Invalid username or password")}`,
      );
    }
    email = profileData;
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/auth/login?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/");
  redirect("/");
}

export async function signUpAction(formData: FormData) {
  const supabase = await createClient();
  const username = formData.get("username") as string;
  const email = formData.get("email") as string;
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

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${await getBaseUrl()}/`,
      data: {
        username,
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
    redirect("/auth/login?error=Please log in to update your password");
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
  provider: "google" | "github" | "apple",
) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${await getBaseUrl()}/`,
    },
  });

  if (error) {
    redirect(`/auth/login?error=${encodeURIComponent(error.message)}`);
  }

  if (data.url) {
    redirect(data.url);
  }
}

export const signInWithGoogleAction = signInWithOAuthAction.bind(
  null,
  "google",
);
export const signInWithGithubAction = signInWithOAuthAction.bind(
  null,
  "github",
);
export const signInWithAppleAction = signInWithOAuthAction.bind(null, "apple");
