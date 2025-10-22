"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { Tables } from "@/lib/supabase/database.types";
import camelcaseKeys from "camelcase-keys";
import { Replace } from "@/utils/replace";
import { getSupabaseUserOrRedirect } from "@/lib/supabase/auth-util";

type Category = Tables<"categories">;

export async function uploadShaderAction(formData: FormData) {
  const { supabase, user } = await getSupabaseUserOrRedirect(
    `/marketplace/upload?error=${encodeURIComponent("Authentication required")}`,
  );

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const code = formData.get("code") as string;
  const priceStr = formData.get("price") as string;
  const categoryIdStr = formData.get("category") as string;

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

  const { data, error } = await supabase.rpc("get_shaders_with_avg", {
    user_uuid: user.id,
  });

  if (error) {
    throw new Error(`Failed rpc function: ${error.message}`);
  }

  // TODO we really shouldn't need to do this shit
  // Look into https://github.com/orgs/supabase/discussions/32925 or stop using
  // JSON objects in db functions altogether
  return camelcaseKeys(
    data as Replace<
      (typeof data)[number],
      {
        category: { id: string; name: string };
        profiles: { username: string };
      }
    >[],
  );
}

export async function getCategories(): Promise<Category[]> {
  const { supabase, user } = await getSupabaseUserOrRedirect(
    "/auth/login?next=/marketplace",
  );

  const { data: categories, error } = await supabase
    .from("categories")
    .select("id, name")
    .order("name");

  if (error) {
    throw new Error(`Failed to load categories: ${error.message}`);
  }

  return categories || [];
}

export async function getTypes(): Promise<Category[]> {
  //TODO
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

export async function getProjects() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/marketplace");
  }

  const { data: purchases } = await supabase
    .from("purchases")
    .select("shader_id") // TODO reutilizing shader_id for projects too
    .eq("user_id", user.id);

  const owned = purchases?.map((p) => p.shader_id) || [];

  let query = supabase
    .from("projects")
    .select(
      `
      id,
      name,
      description,
      price,
      downloads,
      created_at,
      profiles!projects_user_id_fkey (
        username
      )
    `,
    )
    .eq("published", true)
    .order("created_at", { ascending: false });

  // TODO filter purchased projects
  if (owned.length) {
    query = query.not("id", "in", `(${owned.join(",")})`);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to load projects: ${error.message}`);
  }

  return camelcaseKeys(data);
}
