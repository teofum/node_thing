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
import { Replace } from "@/utils/replace";

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

export async function updatePayoutSettingsAction(formData: FormData) {
  // TODO comento para que compile
  // const mpEmail = formData.get("mp_email") as string;
  // const supabase = await createClient();
  // const {
  //   data: { user },
  // } = await supabase.auth.getUser();
  // if (!user) {
  //   redirect("/auth/login?next=/profile");
  // }
  // await supabase
  //   .from("profiles")
  //   .update({ mp_email: mpEmail })
  //   .eq("id", user.id);
  // redirect("/profile");
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
    .select(
      // TODO comento para que compile
      // "username, is_premium, mp_email, pending_balance, cancelled, subscription_id",
      "username, is_premium, cancelled, subscription_id",
    )
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

  const { data, error } = await supabase.rpc("get_published_shaders", {
    user_uuid: user.id,
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

export async function getPurchasedShaders() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/profile");
  }

  const { data, error } = await supabase.rpc("get_purchased_shaders", {
    user_uuid: user.id,
  });

  if (error) {
    throw new Error(`Failed to load purchased shaders: ${error.message}`);
  }

  return camelcaseKeys(
    data as Replace<
      (typeof data)[number],
      { category: { id: string; name: string } }
    >[],
  );
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

export async function deleteShaderReview(shaderId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/profile");
  }

  const { error } = await supabase
    .from("ratings")
    .delete()
    .eq("shader_id", shaderId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(`Failed to delete rating: ${error.message}`);
  }
}
