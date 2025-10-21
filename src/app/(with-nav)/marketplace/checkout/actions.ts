"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { createMPCheckout } from "@/lib/payments/mercadopago";
import { getBaseUrl } from "@/lib/utils";
import { getSupabaseUserOrRedirect } from "@/lib/supabase/auth-util";

export async function createOrderFromCart() {
  const { supabase, user } = await getSupabaseUserOrRedirect(
    "/auth/login?next=/marketplace/cart",
  );

  const { data: orderId, error } = await supabase.rpc("checkout_cart", {
    user_uuid: user.id,
  });

  if (error) {
    if (error.message?.includes("empty")) {
      redirect(
        `/marketplace/cart?error=${encodeURIComponent("Cart is empty")}`,
      );
    } else {
      throw new Error(`Failed to create order: ${error.message}`);
    }
  }

  return orderId;
}

export async function getOrderDetails(orderId: string) {
  const { supabase, user } = await getSupabaseUserOrRedirect(
    `/auth/login?next=/marketplace/checkout/${orderId}`,
  );

  const { data: order, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      total_amount,
      status,
      created_at,
      order_items (
        price,
        shader:shaders (
          id,
          title,
          description,
          downloads
        )
      )
    `,
    )
    .eq("id", orderId)
    .eq("user_id", user.id)
    .single();

  if (error || !order) {
    throw new Error(
      `Order not found or access denied: ${error?.message || "Invalid order ID"}`,
    );
  }

  return order;
}

export async function createMercadoPagoCheckout(orderId: string) {
  const { supabase, user } = await getSupabaseUserOrRedirect(
    `/auth/login?next=/marketplace/checkout/${orderId}`,
  );

  const order = await getOrderDetails(orderId);
  const baseUrl = await getBaseUrl();

  // Get seller info for the first item (assuming single seller per order for now)
  const firstItem = order.order_items[0];
  const { data: shader } = await supabase
    .from("shaders")
    .select(
      `
      user_id,
      profiles!fk_shaders_user_id (
        mp_access_token
      )
    `,
    )
    .eq("id", firstItem.shader.id)
    .single();

  if (!shader?.profiles?.mp_access_token) {
    redirect(
      `/marketplace/checkout/${orderId}?error=${encodeURIComponent("Seller has not connected MercadoPago")}`,
    );
  }

  const marketplaceFee = Math.round(order.total_amount * 0.1); // 10% commission

  await createMPCheckout({
    orderId,
    userId: user.id,
    amount: order.total_amount,
    title: `Shader Purchase - Order ${orderId}`,
    successUrl: `${baseUrl}/marketplace/checkout/${orderId}/success`,
    failureUrl: `${baseUrl}/marketplace/checkout/${orderId}?error=payment_failed`,
    pendingUrl: `${baseUrl}/marketplace/checkout/${orderId}/success`,
    sellerAccessToken: shader.profiles.mp_access_token,
    marketplaceFee,
  });
}

export async function createOrderAndRedirect() {
  const orderId = await createOrderFromCart();
  redirect(`/marketplace/checkout/${orderId}`);
}
