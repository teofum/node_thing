import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { handleSubscriptionChange } from "@/lib/payments/lemonsqueezy";

const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get("x-signature") as string;

  // Verify webhook signature
  const hash = crypto
    .createHmac("sha256", webhookSecret)
    .update(payload)
    .digest("hex");

  if (hash !== signature) {
    return NextResponse.json(
      { error: "Webhook signature verification failed." },
      { status: 400 },
    );
  }

  const event = JSON.parse(payload);
  const eventName = event.meta.event_name;
  const subscriptionData = event.data.attributes;
  const userId = event.meta.custom_data?.user_id;

  try {
    if (!userId) {
      return NextResponse.json({ received: true });
    }

    switch (eventName) {
      case "subscription_created":
      case "subscription_updated":
      case "subscription_resumed":
        await handleSubscriptionChange(
          event.data.id,
          subscriptionData.status,
          userId,
        );
        break;

      case "subscription_cancelled":
        await handleSubscriptionChange(event.data.id, "cancelled", userId);
        break;

      case "subscription_expired":
        await handleSubscriptionChange(event.data.id, "expired", userId);
        break;
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}
