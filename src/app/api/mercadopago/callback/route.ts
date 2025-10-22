import { createClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import { MercadoPagoConfig, OAuth } from "mercadopago";
import { getBaseUrl } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const state = searchParams.get("state");

  if (error || !code || !state) {
    redirect(
      `/marketplace?error=${encodeURIComponent("MercadoPago authentication failed")}`,
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );

  const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN!,
  });

  const oauth = new OAuth(client);
  const baseUrl = await getBaseUrl();

  const tokens = await oauth.create({
    body: {
      client_secret: process.env.MP_CLIENT_SECRET!,
      client_id: process.env.MP_APP_ID!,
      code: code,
      redirect_uri: `${baseUrl}/api/mercadopago/callback`,
    },
  });

  if (!tokens.access_token) {
    redirect(
      `/marketplace?error=${encodeURIComponent("Failed to get MercadoPago token")}`,
    );
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      mp_access_token: tokens.access_token,
      mp_user_id: tokens.user_id,
      mp_refresh_token: tokens.refresh_token,
    })
    .eq("id", state);

  if (updateError) {
    redirect(
      `/marketplace?error=${encodeURIComponent("Failed to save MercadoPago credentials")}`,
    );
  }

  redirect("/marketplace");
}
