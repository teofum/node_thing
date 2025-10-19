"use server";

import { redirect } from "next/navigation";
import {
  createSubscriptionCheckout,
  cancelLemonSqueezySubscription,
  resumeLemonSqueezySubscription,
} from "@/lib/payments/lemonsqueezy";
import { getBaseUrl } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";

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
