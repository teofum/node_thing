"use server";

import { redirect } from "next/navigation";
import { createSubscriptionCheckout } from "@/lib/payments/stripe";
import { getBaseUrl } from "@/lib/utils";

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
