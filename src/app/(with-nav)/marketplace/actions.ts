"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { Tables } from "@/lib/supabase/database.types";
import camelcaseKeys from "camelcase-keys";

type Category = Tables<"categories">;

export async function uploadShaderAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/marketplace/upload?error=${encodeURIComponent("Authentication required")}`,
    );
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const code = formData.get("code") as string;
  const priceStr = formData.get("price") as string;
  const categoryIdStr = formData.get("category") as string;
  const type = formData.get("type") as string;

  if (!title?.trim()) {
    redirect(
      `/marketplace/upload?error=${encodeURIComponent("Title is required")}`,
    );
  }

  if (!code?.trim()) {
    redirect(
      `/marketplace/upload?error=${encodeURIComponent("Shader code cannot be empty")}`,
    );
  }

  const price = parseFloat(priceStr);
  if (isNaN(price) || price < 0) {
    redirect(
      `/marketplace/upload?error=${encodeURIComponent("Valid price is required")}`,
    );
  }

  if (!categoryIdStr) {
    redirect(
      `/marketplace/upload?error=${encodeURIComponent("Category is required")}`,
    );
  }

  const categoryId = parseInt(categoryIdStr);
  if (isNaN(categoryId)) {
    redirect(
      `/marketplace/upload?error=${encodeURIComponent("Invalid category selected")}`,
    );
  }

  const { error } = await supabase.from("shaders").insert({
    user_id: user.id,
    title: title.trim(),
    description: description?.trim() || null,
    code: code.trim(),
    price,
    category_id: categoryId,
    node_config: null,
    type,
  });

  if (error) {
    redirect(`/marketplace/upload?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/marketplace");
  redirect("/marketplace");
}

export async function getShaders(types: ("shader" | "project")[] = ["shader"]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/marketplace");
  }

  const { data: purchases } = await supabase
    .from("purchases")
    .select("shader_id")
    .eq("user_id", user.id);

  const owned = purchases?.map((p) => p.shader_id) || [];

  let query = supabase
    .from("shaders")
    .select(
      `
      id,
      title,
      description,
      price,
      downloads,
      created_at,
      type,
      category:categories (
        id,
        name
      ),
      profiles!fk_shaders_user_id (
        username
      ),
      ratings(rating)
    `,
    )
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (types.length === 1) {
    query = query.eq("type", types[0]);
  } else {
    query = query.in("type", types);
  }

  if (owned.length) {
    query = query.not("id", "in", `(${owned.join(",")})`);
  }

  const { data: shaders, error } = await query;

  if (error) {
    throw new Error(`Failed to load shaders: ${error.message}`);
  }

  const data = shaders.map((shader) => {
    const ratings = (shader.ratings ?? [])
      .map((r) => r.rating)
      .filter((r): r is number => r !== null);

    const rating_count = ratings.length;
    const average_rating =
      rating_count > 0 ? ratings.reduce((a, b) => a + b, 0) / rating_count : 0;

    return {
      ...shader,
      rating_count,
      average_rating,
    };
  });

  return camelcaseKeys(data);
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/marketplace");
  }

  const { data: categories, error } = await supabase
    .from("categories")
    .select("id, name")
    .order("name");

  if (error) {
    throw new Error(`Failed to load categories: ${error.message}`);
  }

  return categories || [];
}

// get shaders that the user bought so they can use them in the editor
// it's not a marketplace action, but I don't know where else to put it :/
export async function getPurchasedShaders() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data: purchases } = await supabase
    .from("purchases")
    .select(
      `
      shader:shaders (
        id,
        title,
        code,
        node_config,
        category:categories(name)
      )
    `,
    )
    .eq("user_id", user.id);

  return purchases?.map((p) => p.shader).filter(Boolean) || [];
}
