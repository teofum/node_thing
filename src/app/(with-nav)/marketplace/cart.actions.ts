"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSupabaseUserOrRedirect } from "@/lib/supabase/auth-util";

export async function addToCart(formData: FormData) {
  const { supabase, user } = await getSupabaseUserOrRedirect(
    "/auth/login?next=/marketplace",
  );

  const itemId = formData.get("itemId") as string;
  const itemType = formData.get("itemType") as "shader" | "project";

  const table = itemType === "shader" ? "shaders" : "projects";
  const idType = itemType === "shader" ? "shader_id" : "project_id";

  const { data: item } = await supabase
    .from(table)
    .select(
      `
      id,
      price,
      user_id,
      purchases!left(${idType}),
      cart_items!left(${idType})
    `,
    )
    .eq("id", itemId)
    .eq("purchases.user_id", user.id)
    .eq("cart_items.user_id", user.id)
    .single();

  if (!item) {
    throw new Error(`${itemType} not found`);
  }

  if (item.purchases?.length > 0) {
    redirect(
      `/marketplace?error=${encodeURIComponent(`You already own this ${itemType}`)}`,
    );
  }

  // currently commented to allow adding own items to cart for testing
  // if (item.user_id === user.id) {
  //   redirect(
  //     `/marketplace?error=${encodeURIComponent(`Cannot add your own ${itemType} to cart`)}`,
  //   );
  // }

  const existing = item.cart_items?.length > 0;

  if (existing) {
    revalidatePath("/marketplace");
    redirect("/marketplace");
  }

  const { error: insertErr } = await supabase.from("cart_items").insert({
    user_id: user.id,
    shader_id: itemType === "shader" ? itemId : null,
    project_id: itemType === "project" ? itemId : null,
    item_type: itemType,
    price_at_time: item.price!,
  });

  if (insertErr) {
    throw new Error(`Failed to add to cart: ${insertErr.message}`);
  }

  revalidatePath("/marketplace");
  revalidatePath("/marketplace/cart");
}

export async function removeFromCart(formData: FormData) {
  const { supabase, user } = await getSupabaseUserOrRedirect(
    "/auth/login?next=/marketplace",
  );

  const itemId = formData.get("itemId") as string;
  const itemType = formData.get("itemType") as "shader" | "project";

  const column = itemType === "shader" ? "shader_id" : "project_id";

  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("user_id", user.id)
    .eq(column, itemId);

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
      project_id,
      item_type,
      price_at_time,
      created_at,
      shader:shaders (
        id,
        title,
        description
      ),
      project:projects (
        id,
        name,
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
  const { supabase, user } = await getSupabaseUserOrRedirect(
    "/auth/login?next=/marketplace",
  );

  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("user_id", user.id);

  if (error) {
    throw new Error(`Failed to clear cart: ${error.message}`);
  }

  revalidatePath("/marketplace/cart");
}
