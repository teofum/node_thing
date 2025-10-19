"use server";

import { Tables } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type ShaderInput = { name: string; type: "color" | "number" };
type ShaderOutput = { name: string; type: "color" | "number" };

export async function generateShaderCode(
  inputs: ShaderInput[],
  outputs: ShaderOutput[],
) {
  const inputBindings = inputs
    .map(
      (input, i) =>
        `@group(0) @binding(${i})\nvar<storage, read> ${input.name}: array<${input.type === "color" ? "vec3f" : "f32"}>;`,
    )
    .join("\n\n");

  const outputBindings = outputs
    .map(
      (output, i) =>
        `@group(0) @binding(${inputs.length + i})\nvar<storage, read_write> ${output.name}: array<${output.type === "color" ? "vec3f" : "f32"}>;`,
    )
    .join("\n\n");

  const uniforms =
    "struct Uniforms {\n    width: u32,\n    height: u32,\n};\n\n@group(1) @binding(0)\nvar<uniform> u: Uniforms;";

  return `${inputBindings}\n\n${outputBindings}\n\n${uniforms}\n\n@compute @workgroup_size(16, 16)`;
}

export async function saveSchema(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const step = parseInt(formData.get("step") as string);

  const inputs = JSON.parse(formData.get("inputs") as string) as Record<
    string,
    { name: string; type: string }
  >;
  const outputs = JSON.parse(formData.get("outputs") as string) as Record<
    string,
    { name: string; type: string }
  >;

  // at least 1 input or 1 output
  if (Object.keys(inputs).length === 0 && Object.keys(outputs).length === 0) {
    redirect(
      `/marketplace/upload?id=${id}&error=${encodeURIComponent("Must have at least 1 input or 1 output")}`,
    );
  }

  await supabase
    .from("shaders")
    .update({ step, node_config: { inputs, outputs } })
    .eq("id", id);

  redirect(`/marketplace/upload?id=${id}`);
}

export async function saveCode(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const code = formData.get("code") as string;

  await supabase
    .from("shaders")
    .update({ step: 4, code: code.trim() })
    .eq("id", id);

  redirect(`/marketplace/upload?id=${id}`);
}

export async function publishShader(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const category_id = parseInt(formData.get("category_id") as string);

  const { data: draft } = await supabase
    .from("shaders")
    .select("code, node_config")
    .eq("id", id)
    .single();

  const { data: category } = await supabase
    .from("categories")
    .select("name")
    .eq("id", category_id)
    .single();

  if (draft) {
    const currentConfig = draft.node_config as {
      inputs?: Record<string, { name: string; type: string }>;
      outputs?: Record<string, { name: string; type: string }>;
    } | null;

    const inputs = Object.values(currentConfig?.inputs || {}) as ShaderInput[];
    const outputs = Object.values(
      currentConfig?.outputs || {},
    ) as ShaderOutput[];

    const generatedCode = await generateShaderCode(inputs, outputs);
    const completeShader = `${generatedCode}\n${draft.code}`;

    const updatedConfig = {
      name: title,
      category: category?.name,
      shader: completeShader,
      inputs: currentConfig?.inputs || {},
      outputs: currentConfig?.outputs || {},
      parameters: {},
    };

    await supabase
      .from("shaders")
      .update({
        title,
        description,
        price,
        category_id,
        node_config: updatedConfig,
        published: true,
      })
      .eq("id", id);
  }

  redirect("/marketplace");
}

export async function getUserProjects() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/marketplace/upload");
  }

  let projects: Tables<"projects">[] = [];

  if (user) {
    const { data: data, error } = await supabase
      .from("profiles")
      .select("username, is_premium")
      .eq("id", user.id)
      .single();

    if (error) {
      throw new Error(`Failed to load user data: ${error.message}`);
    }

    if (data?.is_premium) {
      const { data: projectData } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });
      projects = projectData ?? [];
    }
  }

  return projects;
}

export async function getCreatedShaders() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/marketplace/upload");
  }

  const { data, error } = await supabase
    .from("shaders")
    .select("*")
    .eq("user_id", user.id);

  if (error) {
    throw new Error(`Failed to load published shaders: ${error.message}`);
  }

  const shaders: Tables<"shaders">[] = data ?? [];
  return shaders;
}
