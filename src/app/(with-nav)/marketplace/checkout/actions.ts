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

  await createMPCheckout({
    orderId,
    userId: user.id,
    amount: order.total_amount,
    title: `Shader Purchase - Order ${orderId}`,
    successUrl: `${baseUrl}/marketplace/checkout/${orderId}/success`,
    failureUrl: `${baseUrl}/marketplace/checkout/${orderId}?error=payment_failed`,
    pendingUrl: `${baseUrl}/marketplace/checkout/${orderId}/success`,
  });
}

export async function createOrderAndRedirect() {
  const orderId = await createOrderFromCart();
  redirect(`/marketplace/checkout/${orderId}`);
}
