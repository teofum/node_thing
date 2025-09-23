"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function addToCart(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/marketplace");
  }

  const shaderId = formData.get("shaderId") as string;

  const { data: result, error } = await supabase
    .from("shaders")
    .select(
      `
      id,
      price,
      user_id,
      purchases!left(shader_id),
      cart_items!left(shader_id)
    `,
    )
    .eq("id", shaderId)
    .eq("purchases.user_id", user.id)
    .eq("cart_items.user_id", user.id)
    .single();

  if (error || !result) {
    throw new Error(
      `Shader not found: ${error?.message || "Invalid shader ID"}`,
    );
  }

  if (result.purchases?.length > 0) {
    redirect(
      `/marketplace?error=${encodeURIComponent("You already own this shader")}`,
    );
  }

  // currently commented to allow adding own shaders to cart for testing
  // if (result.user_id === user.id) {
  //   redirect(`/marketplace?error=${encodeURIComponent("Cannot add your own shader to cart")}`);
  // }

  const existing = result.cart_items?.length > 0;

  if (existing) {
    revalidatePath("/marketplace");
    redirect("/marketplace");
  }

  const { error: insertErr } = await supabase.from("cart_items").insert({
    user_id: user.id,
    shader_id: shaderId,
    price_at_time: result.price,
  });

  if (insertErr) {
    throw new Error(`Failed to add to cart: ${insertErr.message}`);
  }

  revalidatePath("/marketplace");
  revalidatePath("/marketplace/cart");
}

export async function removeFromCart(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/marketplace");
  }

  const shaderId = formData.get("shaderId") as string;

  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("user_id", user.id)
    .eq("shader_id", shaderId);

  if (error) {
    throw new Error(`Failed to remove from cart: ${error.message}`);
  }

  revalidatePath("/marketplace/cart");
}

export async function getCartItems() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data: cartItems, error } = await supabase
    .from("cart_items")
    .select(
      `
      shader_id,
      price_at_time,
      created_at,
      shader:shaders (
        id,
        title,
        description
      )
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load cart: ${error.message}`);
  }

  return cartItems || [];
}

export async function clearCart() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/marketplace");
  }

  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("user_id", user.id);

  if (error) {
    throw new Error(`Failed to clear cart: ${error.message}`);
  }

  revalidatePath("/marketplace/cart");
}
