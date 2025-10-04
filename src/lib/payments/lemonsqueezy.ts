import {
  lemonSqueezySetup,
  createCheckout,
  updateSubscription,
} from "@lemonsqueezy/lemonsqueezy.js";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

lemonSqueezySetup({
  apiKey: process.env.LEMONSQUEEZY_API_KEY!,
});

export async function createSubscriptionCheckout({
  variantId,
  successUrl,
}: {
  variantId: string;
  successUrl: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data, error } = await createCheckout(
    process.env.LEMONSQUEEZY_STORE_ID!,
    variantId,
    {
      checkoutData: {
        email: user.email,
        custom: {
          user_id: user.id,
        },
      },
      productOptions: {
        redirectUrl: successUrl,
      },
    },
  );

  if (error) {
    throw new Error(error.message);
  }

  redirect(data!.data.attributes.url);
}

export async function handleSubscriptionChange(
  subscriptionId: string,
  status: string,
  userId: string,
) {
  if (!userId || userId === "undefined") {
    return;
  }

  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );

  if (status === "active" || status === "on_trial") {
    await supabase
      .from("profiles")
      .update({
        subscription_id: subscriptionId,
        is_premium: true,
        cancelled: false,
      })
      .eq("id", userId);
  } else if (status === "cancelled") {
    await supabase
      .from("profiles")
      .update({
        is_premium: true,
        cancelled: true,
      })
      .eq("subscription_id", subscriptionId);
  } else if (status === "expired" || status === "unpaid") {
    await supabase
      .from("profiles")
      .update({
        subscription_id: null,
        is_premium: false,
        cancelled: false,
      })
      .eq("subscription_id", subscriptionId);
  }
}

export async function cancelLemonSqueezySubscription(subscriptionId: string) {
  const { error } = await updateSubscription(subscriptionId, {
    cancelled: true,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function resumeLemonSqueezySubscription(subscriptionId: string) {
  const { error } = await updateSubscription(subscriptionId, {
    cancelled: false,
  });

  if (error) {
    throw new Error(error.message);
  }
}
