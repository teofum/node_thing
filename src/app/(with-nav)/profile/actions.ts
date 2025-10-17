"use server";

import { redirect } from "next/navigation";
import {
  createSubscriptionCheckout,
  cancelLemonSqueezySubscription,
  resumeLemonSqueezySubscription,
} from "@/lib/payments/lemonsqueezy";
import { getBaseUrl } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { PostgrestError } from "@supabase/supabase-js";
import camelcaseKeys from "camelcase-keys";

export async function subscribePremiumAction(formData: FormData) {
  const variantId = formData.get("variant_id") as string;

  if (!variantId) {
    redirect("/?error=invalid_subscription");
  }

  const baseUrl = await getBaseUrl();

  await createSubscriptionCheckout({
    variantId,
    successUrl: `${baseUrl}/profile/success`,
  });
}

export async function cancelSubscriptionAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/profile");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_id")
    .eq("id", user.id)
    .single();

  if (!profile?.subscription_id) {
    redirect("/profile?error=no_subscription");
  }

  try {
    await cancelLemonSqueezySubscription(profile.subscription_id);
  } catch {
    redirect("/profile?error=cancellation_failed");
  }

  await supabase.from("profiles").update({ cancelled: true }).eq("id", user.id);

  redirect("/profile");
}

export async function resumeSubscriptionAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/profile");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_id")
    .eq("id", user.id)
    .single();

  if (!profile?.subscription_id) {
    redirect("/profile?error=no_subscription");
  }

  try {
    await resumeLemonSqueezySubscription(profile.subscription_id);
  } catch {
    redirect("/profile?error=resume_failed");
  }

  await supabase
    .from("profiles")
    .update({ cancelled: false })
    .eq("id", user.id);

  redirect("/profile");
}

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
    .select("username, is_premium, mp_access_token, cancelled, subscription_id")
    .eq("id", user.id)
    .single();

  if (error) {
    throw new Error(`Failed to load user data: ${error.message}`);
  }

  return camelcaseKeys(data, { deep: true });
}

export async function getPublishedShaders() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/profile");
  }

  const { data, error } = await supabase
    .from("shaders")
    .select(
      `
      id,
      title,
      category:categories(name)
      `,
    )
    .eq("user_id", user.id)
    .eq("published", true);

  if (error) {
    throw new Error(`Failed to load published shaders: ${error.message}`);
  }

  return camelcaseKeys(data) ?? [];
}

export async function getPurchasedShaders() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/profile");
  }

  const errorMessage = (err: PostgrestError) => {
    return `Failed to load purchased shaders: ${err.message}`;
  };

  const { data: purchases, error: err1 } = await supabase
    .from("purchases")
    .select("shader_id")
    .eq("user_id", user.id);

  if (err1) throw new Error(errorMessage(err1));

  const shaderIds = purchases.map((p) => p.shader_id);

  const { data: shaders, error: err2 } = await supabase
    .from("shaders")
    .select("id, title, category:categories(name)")
    .in("id", shaderIds);

  if (err2) throw new Error(errorMessage(err2));

  return camelcaseKeys(shaders) ?? [];
}

export async function submitShaderReview(
  shaderId: string,
  rating: number,
  comment: string,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/profile");
  }

  const { error: upsertError } = await supabase.from("ratings").upsert(
    {
      shader_id: shaderId,
      user_id: user.id,
      rating,
      comment,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id, shader_id",
    },
  );

  if (upsertError) {
    throw new Error(`Failed to upsert rating: ${upsertError.message}`);
  }
}

export async function getUserRatings() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/profile");
  }

  const { data, error } = await supabase
    .from("ratings")
    .select("id, shader_id, rating, comment, updated_at")
    .eq("user_id", user.id);

  if (error) {
    throw new Error(`Failed to load user ratings: ${error.message}`);
  }

  return camelcaseKeys(data) ?? [];
}

export async function setUsername(newUsername: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/profile");
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
