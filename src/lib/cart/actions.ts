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

  const { data: shader, error: shaderError } = await supabase
    .from("shaders")
    .select("price, user_id, title")
    .eq("id", shaderId)
    .single();

  if (shaderError || !shader) {
    redirect(`/marketplace?error=${encodeURIComponent("Shader not found")}`);
  }

  // currently commented to allow adding own shaders to cart for testing
  // if (shader.user_id === user.id) {
  //   redirect(`/marketplace?error=${encodeURIComponent("Cannot add your own shader to cart")}`);
  // }

  const { data: existing } = await supabase
    .from("cart_items")
    .select("shader_id")
    .eq("user_id", user.id)
    .eq("shader_id", shaderId)
    .single();

  if (existing) {
    redirect(
      `/marketplace?message=${encodeURIComponent("Item already in cart")}`,
    );
  }

  const { error } = await supabase.from("cart_items").insert({
    user_id: user.id,
    shader_id: shaderId,
    price_at_time: shader.price,
    shader_title: shader.title,
  });

  if (error) {
    redirect(`/marketplace?error=${encodeURIComponent(error.message)}`);
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
    redirect(`/marketplace/cart?error=${encodeURIComponent(error.message)}`);
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
      shaders!inner (
        id,
        title,
        description
      )
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    redirect(
      `/marketplace/cart?error=${encodeURIComponent("Failed to load cart")}`,
    );
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
    redirect(`/marketplace/cart?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/marketplace/cart");
}
