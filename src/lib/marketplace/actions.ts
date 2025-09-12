"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { Tables } from "@/lib/supabase/database.types";

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

  // required fields
  const title = formData.get("title") as string;
  const shaderFile = formData.get("shaderFile") as File;
  const priceStr = formData.get("price") as string;
  const categoryIdStr = formData.get("category") as string;

  if (!title?.trim()) {
    redirect(
      `/marketplace/upload?error=${encodeURIComponent("Title is required")}`,
    );
  }

  if (!shaderFile || shaderFile.size === 0) {
    redirect(
      `/marketplace/upload?error=${encodeURIComponent("Shader file is required")}`,
    );
  }

  if (!shaderFile.name.endsWith(".wgsl")) {
    redirect(
      `/marketplace/upload?error=${encodeURIComponent("Only .wgsl files are supported")}`,
    );
  }

  const code = await shaderFile.text();

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

  // optional fields
  const description = formData.get("description") as string;

  const { error } = await supabase.from("shaders").insert({
    user_id: user.id,
    title: title.trim(),
    description: description?.trim() || null,
    code: code.trim(),
    price,
    category_id: categoryId,
  });

  if (error) {
    redirect(`/marketplace/upload?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/marketplace");
  redirect("/marketplace");
}

export async function getShaders() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/marketplace");
  }

  const { data, error } = await supabase
    .from("shaders")
    .select(
      `
      id,
      title,
      price,
      category:categories (
        id,
        name
      )
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    redirect(
      `/marketplace?error=${encodeURIComponent("Failed to load shaders")}`,
    );
  }

  return data || [];
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
    redirect(
      `/marketplace?error=${encodeURIComponent("Failed to load categories")}`,
    );
  }

  return categories || [];
}
