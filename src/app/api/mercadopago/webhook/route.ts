import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

function validateSignature(
  request: NextRequest,
  body: { data: { id: string } },
): boolean {
  const xSignature = request.headers.get("x-signature");
  const xRequestId = request.headers.get("x-request-id");

  if (!xSignature || !xRequestId) {
    console.error("Missing signature headers");
    return false;
  }

  const parts = xSignature.split(",");
  let ts: string | undefined;
  let hash: string | undefined;

  parts.forEach((part) => {
    const [key, value] = part.split("=");
    if (key?.trim() === "ts") ts = value?.trim();
    if (key?.trim() === "v1") hash = value?.trim();
  });

  if (!ts || !hash) {
    console.error("Invalid signature format");
    return false;
  }

  const dataId = body.data?.id;
  if (!dataId) {
    console.error("Missing data.id");
    return false;
  }

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  const secret = process.env.MP_WEBHOOK_SECRET!;

  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(manifest);
  const sha = hmac.digest("hex");

  return sha === hash;
}

export async function POST(request: NextRequest) {
  try {
    console.log("[MP Webhook] Received notification");

    const body: { data: { id: string } } = await request.json();
    console.log("[MP Webhook] Payment ID:", body.data.id);

    // Validate signature
    if (!validateSignature(request, body)) {
      console.error("[MP Webhook] Invalid signature");
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 401,
      });
    }

    console.log("[MP Webhook] Signature validated");

    const client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN!,
    });

    const payment = await new Payment(client).get({ id: body.data.id });
    console.log("[MP Webhook] Payment status:", payment.status);
    console.log("[MP Webhook] Payment metadata:", payment.metadata);

    if (payment.status === "approved") {
      const orderId = payment.external_reference;
      const userId = payment.metadata?.user_id;

      console.log("[MP Webhook] Order ID:", orderId, "User ID:", userId);

      if (!orderId || !userId) {
        console.error("[MP Webhook] Missing orderId or userId");
        return new Response(JSON.stringify({ error: "Missing data" }), {
          status: 400,
        });
      }

      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } },
      );

      const { error } = await supabase.rpc("finish_payment", {
        order_uuid: orderId,
        user_uuid: userId,
      });

      if (error) {
        console.error("[MP Webhook] finish_payment error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
        });
      }

      console.log("[MP Webhook] Payment processed successfully");
      revalidatePath("/marketplace");
    }

    return new Response(null, { status: 200 });
  } catch (error) {
    console.error("[MP Webhook] Error:", error);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
    });
  }
}
