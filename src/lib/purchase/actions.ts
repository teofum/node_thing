"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createOrderFromCart() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/marketplace/cart");
  }

  const { data: orderId, error } = await supabase.rpc("checkout_cart", {
    user_uuid: user.id,
  });

  if (error) {
    redirect(`/marketplace/cart?error=${encodeURIComponent("Cart is empty")}`);
  }

  return orderId;
}

export async function completePayment(orderId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/login?next=/marketplace/checkout/${orderId}`);
  }

  const { error } = await supabase.rpc("finish_payment", {
    order_uuid: orderId,
    user_uuid: user.id,
  });

  if (error) {
    redirect(
      `/marketplace/checkout/${orderId}?error=${encodeURIComponent("Payment failed")}`,
    );
  }

  revalidatePath("/marketplace");
  revalidatePath("/marketplace/cart");
}

export async function getOrderDetails(orderId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/login?next=/marketplace/checkout/${orderId}`);
  }

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
          description
        )
      )
    `,
    )
    .eq("id", orderId)
    .eq("user_id", user.id)
    .single();

  if (error || !order) {
    redirect(
      `/marketplace/cart?error=${encodeURIComponent("Order not found")}`,
    );
  }

  return order;
}

export async function completePaymentAndRedirect(orderId: string) {
  await completePayment(orderId);
  redirect(`/marketplace/checkout/${orderId}/success`);
}

export async function createOrderAndRedirect() {
  const orderId = await createOrderFromCart();
  redirect(`/marketplace/checkout/${orderId}`);
}
