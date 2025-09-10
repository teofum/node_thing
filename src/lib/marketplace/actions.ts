"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function uploadShaderAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/marketplace/upload");
  }

  // required fields
  const title = formData.get("title") as string;
  const code = formData.get("code") as string;
  const priceStr = formData.get("price") as string;

  if (!title?.trim()) {
    redirect(
      `/marketplace/upload?error=${encodeURIComponent("Title is required")}`,
    );
  }

  if (!code?.trim()) {
    redirect(
      `/marketplace/upload?error=${encodeURIComponent("Shader code is required")}`,
    );
  }

  const price = parseFloat(priceStr);
  if (isNaN(price) || price < 0) {
    redirect(
      `/marketplace/upload?error=${encodeURIComponent("Valid price is required")}`,
    );
  }

  // optional fields
  const description = formData.get("description") as string;
  const tagsStr = formData.get("tags") as string;
  const tags = tagsStr
    ? tagsStr
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    : [];

  const { error } = await supabase.from("shaders").insert({
    user_id: user.id,
    title: title.trim(),
    description: description?.trim() || null,
    code: code.trim(),
    price,
    tags,
  });

  if (error) {
    redirect(`/marketplace/upload?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/marketplace");
  redirect("/marketplace");
}

export async function getShaders() {
  const supabase = await createClient();

  const { data: shaders, error } = await supabase
    .from("shaders")
    .select("id, title, price")
    .order("created_at", { ascending: false });

  if (error) {
    redirect(
      `/marketplace?error=${encodeURIComponent("Failed to load shaders")}`,
    );
  }

  return shaders || [];
}
