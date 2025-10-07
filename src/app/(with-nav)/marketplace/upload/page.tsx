import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Tables } from "@/lib/supabase/database.types";
import { SchemaForm } from "./components/schema-form";
import { CodeForm } from "./components/code-form";
import { PublishForm } from "./components/publish-form";

type ShaderInput = { name: string; type: "color" | "number" };
type ShaderOutput = { name: string; type: "color" | "number" };

export default async function UploadPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; error?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/marketplace/upload");
  }

  const params = await searchParams;
  let draft: Tables<"shaders"> | null = null;

  // TODO: let the user continue editing an existing draft
  // also go back in the form
  if (params.id) {
    const { data } = await supabase
      .from("shaders")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .eq("published", false)
      .single();
    draft = data;
  }

  // start a new upload draft
  if (!draft) {
    const { data } = await supabase
      .from("shaders")
      .insert({
        user_id: user.id,
        title: "Untitled Shader",
        description: "",
        code: "",
        category_id: 0,
        price: 0,
        downloads: 0,
        node_config: {
          inputs: [{ name: "input", type: "color" }],
          outputs: [{ name: "output", type: "color" }],
        },
        published: false,
        step: 1,
      })
      .select()
      .single();

    if (data) {
      redirect(`/marketplace/upload?id=${data.id}`);
    }
  }

  const nodeConfig = draft?.node_config as {
    inputs?: ShaderInput[];
    outputs?: ShaderOutput[];
  } | null;
  const inputs = nodeConfig?.inputs || [
    { name: "input", type: "color" as const },
  ];
  const outputs = nodeConfig?.outputs || [
    { name: "output", type: "color" as const },
  ];
  const currentStep = draft!.step;

  // categories for select in publish form
  const { data: categories, error } = await supabase
    .from("categories")
    .select("id, name")
    .order("name");

  if (error) {
    throw new Error(`Failed to load categories: ${error.message}`);
  }

  return (
    <div className="min-h-screen bg-neutral-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Create Shader</h1>
        </div>

        <div className="glass glass-border rounded-xl p-6">
          {currentStep === 1 && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">
                Define Schema
              </h2>
              <SchemaForm
                draftId={draft!.id}
                initialInputs={inputs}
                initialOutputs={outputs}
                error={params.error}
              />
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">
                Write Code
              </h2>
              <CodeForm
                draftId={draft!.id}
                initialCode={draft!.code}
                inputs={inputs}
                outputs={outputs}
              />
            </div>
          )}

          {currentStep === 4 && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Publish</h2>
              <PublishForm
                draftId={draft!.id}
                initialTitle={draft!.title}
                initialDescription={draft!.description || ""}
                initialPrice={draft!.price}
                initialCategoryId={draft!.category_id}
                categories={categories!}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
