import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Tables } from "@/lib/supabase/database.types";
import { SchemaForm } from "./components/schema-form";
import { CodeForm } from "./components/code-form";
import { PublishForm } from "./components/publish-form";
import { getUserProjects } from "./actions";
import { Button } from "@/ui/button";

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

  const projects = await getUserProjects();

  return (
    <div className="min-h-screen bg-neutral-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Publish shader</h1>
        </div>
        <div className="glass glass-border rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Your shaders
          </h2>
          <div className="space-y-6 glass glass-border p-6 rounded-xl ">
            <div className="space-y-1 ">
              <h1>TODO Santi</h1>
            </div>
          </div>
        </div>

        <div className="mt-8 mb-8">
          <h1 className="text-3xl font-bold text-white">Publish project</h1>
        </div>
        <div className="glass glass-border rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Your projects
          </h2>
          <div className="space-y-6 glass glass-border p-6 rounded-xl ">
            <div className="space-y-1 ">
              {/* TODO Juani mejor diseño */}
              {projects.length ? (
                projects.map((currProject) => (
                  <div
                    key={currProject.id}
                    className="flex flex-row items-center min-h-0 min-w-0 justify-between mb-3 border border-white/15 rounded-md p-3"
                  >
                    {currProject.name}

                    {currProject.published ? (
                      <Button
                        type="submit"
                        variant="ghost"
                        size="sm"
                        icon
                        disabled
                      >
                        Publish
                      </Button>
                    ) : (
                      <Button type="submit" variant="ghost" size="sm" icon>
                        Publish
                      </Button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-white/50 mt-2">No projects yet...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
