import { MercadoPagoConfig, Preference } from "mercadopago";
import { redirect } from "next/navigation";

export async function createMPCheckout({
  orderId,
  userId,
  amount,
  title,
  successUrl,
  failureUrl,
  pendingUrl,
}: {
  orderId: string;
  userId: string;
  amount: number;
  title: string;
  successUrl: string;
  failureUrl: string;
  pendingUrl: string;
}) {
  const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN!,
  });

  const preference = new Preference(client);

  const response = await preference.create({
    body: {
      items: [
        {
          id: orderId,
          title,
          unit_price: amount,
          quantity: 1,
        },
      ],
      external_reference: orderId,
      metadata: {
        user_id: userId,
      },
      back_urls: {
        success: successUrl,
        failure: failureUrl,
        pending: pendingUrl,
      },
      auto_return: "approved",
    },
  });

  redirect(response.init_point!);
}
