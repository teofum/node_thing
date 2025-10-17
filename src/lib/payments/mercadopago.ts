import { MercadoPagoConfig, Preference } from "mercadopago";
import { redirect } from "next/navigation";
import { getBaseUrl } from "@/lib/utils";

export async function createMPCheckout({
  orderId,
  userId,
  amount,
  title,
  successUrl,
  failureUrl,
  pendingUrl,
  sellerAccessToken,
  marketplaceFee = 0,
}: {
  orderId: string;
  userId: string;
  amount: number;
  title: string;
  successUrl: string;
  failureUrl: string;
  pendingUrl: string;
  sellerAccessToken: string;
  marketplaceFee?: number;
}) {
  const client = new MercadoPagoConfig({
    accessToken: sellerAccessToken,
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
      marketplace_fee: marketplaceFee,
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

export async function generateMPAuthUrl(userId: string): Promise<string> {
  const baseUrl = await getBaseUrl();
  const params = new URLSearchParams({
    client_id: process.env.MP_APP_ID!,
    response_type: "code",
    platform_id: "mp",
    state: userId,
    redirect_uri: `${baseUrl}/api/mercadopago/callback`,
  });

  return `https://auth.mercadopago.com/authorization?${params.toString()}`;
}
