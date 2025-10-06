import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  const body: { data: { id: string } } = await request.json();

  const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN!,
  });

  const payment = await new Payment(client).get({ id: body.data.id });

  if (payment.status === "approved") {
    const orderId = payment.external_reference;
    const userId = payment.metadata?.user_id;

    if (orderId && userId) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } },
      );

      await supabase.rpc("finish_payment", {
        order_uuid: orderId,
        user_uuid: userId,
      });

      revalidatePath("/marketplace");
    }
  }

  return new Response(null, { status: 200 });
}
