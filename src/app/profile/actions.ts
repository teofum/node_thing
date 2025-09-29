"use server";

import { redirect } from "next/navigation";
import { createSubscriptionCheckout, stripe } from "@/lib/payments/stripe";
import { getBaseUrl } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";

export async function subscribePremiumAction(formData: FormData) {
  const priceId = formData.get("price_id") as string;

  if (!priceId) {
    redirect("/?error=invalid_subscription");
  }

  const baseUrl = await getBaseUrl();

  await createSubscriptionCheckout({
    priceId,
    successUrl: `${baseUrl}/api/stripe/checkout?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${baseUrl}/profile`,
  });
}

export async function cancelSubscriptionAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
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
    await stripe.subscriptions.update(profile.subscription_id, {
      cancel_at_period_end: true,
    });
  } catch {
    redirect("/profile?error=cancellation_failed");
  }

  await supabase.from("profiles").update({ cancelled: true }).eq("id", user.id);

  redirect("/profile");
}
