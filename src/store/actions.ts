"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { HandleDescriptor } from "./project.store";

export async function saveNewShader(desc: {
  name: string;
  inputs: HandleDescriptor[];
  outputs: HandleDescriptor[];
  code: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data, error } = await supabase
    .from("shaders")
    .insert({
      user_id: user.id,
      title: desc.name.trim(),
      description: "",
      code: desc.code.trim(),
      price: 0,
      category_id: 0,
      node_config: desc,
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(
      `Failed to save shader: ${error?.message ?? "no data returned"}`,
    );
  }

  return data;
}

export async function updateShader(
  desc: {
    name: string;
    inputs: HandleDescriptor[];
    outputs: HandleDescriptor[];
    code: string;
  },
  id: string,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data, error } = await supabase
    .from("shaders")
    .update({
      title: desc.name.trim(),
      code: desc.code.trim(),
      node_config: desc,
    })
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to save shader: ${error.message}`);
  }

  return data;
}

export async function deleteShader(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { error } = await supabase.from("shaders").delete().eq("id", id);

  if (error) {
    throw new Error(`Failed to save shader: ${error.message}`);
  }
}

export async function getCustomShaders() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data, error } = await supabase
    .from("shaders")
    .select("*")
    .eq("user_id", user.id);

  if (error) {
    throw new Error(`Failed to load published shaders: ${error.message}`);
  }

  return data ?? [];
}
