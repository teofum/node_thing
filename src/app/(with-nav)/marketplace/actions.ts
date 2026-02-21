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

export async function getItems() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/marketplace");
  }

  const { data: shaders, error: shadersError } = await supabase.rpc(
    "get_shaders_with_avg",
    {
      user_uuid: user.id,
    },
  );

  if (shadersError) {
    throw new Error(`Failed rpc function: ${shadersError.message}`);
  }

  const { data: projects, error: projectsrror } = await supabase.rpc(
    "get_projects_with_avg",
    {
      user_uuid: user.id,
    },
  );

  if (projectsrror) {
    throw new Error(`Failed rpc function: ${projectsrror.message}`);
  }

  // TODO we really shouldn't need to do this shit
  // Look into https://github.com/orgs/supabase/discussions/32925 or stop using
  // JSON objects in db functions altogether
  // update: TODO DB structure is almost final
  // and database.types.ts is not expected to change
  return {
    shaders: camelcaseKeys(
      shaders as Replace<
        (typeof shaders)[number],
        {
          category: { id: string; name: string };
          profiles: { username: string };
        }
      >[],
    ),
    projects: camelcaseKeys(
      projects as Replace<
        (typeof projects)[number],
        {
          profiles: { username: string };
        }
      >[],
    ),
  };
}

export async function getCategories(): Promise<Category[]> {
  const { supabase } = await getSupabaseUserOrRedirect(
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

export async function getImage(itemType: "shader" | "project", itemId: string) {
  const { supabase } = await getSupabaseUserOrRedirect(
    "/auth/login?next=/marketplace",
  );

  const { data: imageName, error } = await supabase
    .from(`${itemType}s`)
    .select("image_name")
    .eq("id", itemId)
    .single();

  if (error) {
    throw new Error(`Failed to load image name: ${error.message}`);
  }

  if (imageName.image_name == null) {
    return null;
  }

  const { data } = supabase.storage
    .from("marketplace_images")
    .getPublicUrl(imageName.image_name);

  return data.publicUrl;
}

export async function addToLibrary(formData: FormData) {
  const { supabase, user } = await getSupabaseUserOrRedirect(
    "/auth/login?next=/marketplace",
  );

  const itemId = formData.get("itemId") as string;
  const itemType = formData.get("itemType") as "shader" | "project";

  const table = itemType === "shader" ? "shaders" : "projects";
  const idType = itemType === "shader" ? "shader_id" : "project_id";

  const { data: item, error } = await supabase
    .from(table)
    .select("id, price, user_id")
    .eq("id", itemId)
    .single();

  if (!item || error) {
    redirect(
      `/marketplace?error=${encodeURIComponent(`${itemType} not found`)}`,
    );
  }

  // check if already in user library
  const { error: insertErr } = await supabase.from("purchases").insert({
    user_id: user.id,
    shader_id: itemType === "shader" ? itemId : null,
    project_id: itemType === "project" ? itemId : null,
    item_type: itemType,
  });

  if (insertErr) {
    redirect(
      `/marketplace?error=${encodeURIComponent(`Failed to add to library: ${insertErr?.message}`)}`,
    );
  }

  revalidatePath("/marketplace");
}
