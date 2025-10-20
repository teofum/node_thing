"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { NodeType } from "@/schemas/node.schema";

export async function saveShader(node: NodeType) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { error } = await supabase.from("shaders").insert({
    user_id: user.id,
    title: node.name.trim(),
    description: null,
    code: node.shader.trim(),
    price: 0,
    category_id: 0,
    node_config: node,
  });

  if (error) {
    throw new Error(`Failed to save shader: ${error.message}`);
  }
}

export async function updateShader(node: NodeType) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  /*
  TODO: de alguna forma conseguir el shader ID del que estaba editando

  const { error } = await supabase.from("shaders").update({
    
  });

  if (error) {
    throw new Error(`Failed to save shader: ${error.message}`);
  }
  */
}
