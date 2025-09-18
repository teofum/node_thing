import { Input } from "@/ui/input";
import { Button, LinkButton } from "@/ui/button";
import { uploadShaderAction, getCategories } from "../actions";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function UploadPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/marketplace/upload");
  }

  const params = await searchParams;
  const categories = await getCategories();

  return (
    <div className="min-h-screen bg-neutral-900 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Upload Shader</h1>
          <p className="text-neutral-400 mt-2">
            Share your shader with the community
          </p>
        </div>

        <div className="glass glass-border rounded-xl p-6">
          <form action={uploadShaderAction} className="space-y-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-semibold mb-2"
              >
                Title
              </label>
              <Input
                id="title"
                name="title"
                type="text"
                required
                className="w-full"
                placeholder="My Awesome Shader"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-semibold mb-2"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe your shader..."
              />
            </div>

            <div>
              <label
                htmlFor="shaderFile"
                className="block text-sm font-semibold mb-2"
              >
                Shader File (.wgsl)
              </label>
              <input
                id="shaderFile"
                name="shaderFile"
                type="file"
                accept=".wgsl"
                required
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-white cursor-pointer hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500 file:hidden"
              />
              <div className="text-sm text-neutral-400 mt-1">
                Click to select a .wgsl file
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-semibold mb-2"
                >
                  Price ($)
                </label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  className="w-full [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="9.99"
                />
              </div>

              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-semibold mb-2"
                >
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">None selected</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {params.error && (
              <p className="text-sm text-red-600">{params.error}</p>
            )}

            <div className="flex gap-4">
              <Button type="submit" className="flex-1">
                Upload Shader
              </Button>
              <LinkButton href="/marketplace" variant="outline">
                Cancel
              </LinkButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
