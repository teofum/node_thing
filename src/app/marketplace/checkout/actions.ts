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
    throw new Error(`Payment processing failed: ${error.message}`);
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
    throw new Error(
      `Order not found or access denied: ${error?.message || "Invalid order ID"}`,
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
