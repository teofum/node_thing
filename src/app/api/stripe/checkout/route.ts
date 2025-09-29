import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/payments/stripe";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const userId = session.client_reference_id;

    if (!userId) {
      throw new Error("No user ID found");
    }

    const supabase = await createClient();
    const subscriptionId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription?.id;

    if (subscriptionId) {
      await supabase
        .from("profiles")
        .update({
          subscription_id: subscriptionId,
          is_premium: true,
        })
        .eq("id", userId);
    }

    return NextResponse.redirect(new URL("/profile/success", request.url));
  } catch {
    return NextResponse.redirect(new URL("/profile/cancel", request.url));
  }
}
