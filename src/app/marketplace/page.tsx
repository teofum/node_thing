import { LinkButton } from "@/ui/button";
import { LuArrowLeft } from "react-icons/lu";
import { getShaders } from "@/lib/marketplace/actions";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function MarketplacePage({ searchParams }: Props) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/marketplace");
  }

  const params = await searchParams;
  const shaders = params.error ? [] : await getShaders();

  return (
    <div className="min-h-screen bg-neutral-900 relative">
      <LinkButton variant="ghost" href="/" className="absolute top-4 left-4">
        <LuArrowLeft />
        Back
      </LinkButton>

      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Shader Marketplace
              </h1>
              <p className="text-neutral-400 mt-2">
                Discover and share amazing shaders
              </p>
            </div>
            <LinkButton href="/marketplace/upload">Upload Shader</LinkButton>
          </div>

          {params.error ? (
            <div className="bg-red-900/20 border border-red-700 text-red-400 px-4 py-3 rounded mb-6">
              {decodeURIComponent(params.error)}
            </div>
          ) : shaders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-neutral-400">
                No shaders yet. Be the first to upload one!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {shaders.map((shader) => (
                <div
                  key={shader.id}
                  className="glass glass-border p-6 rounded-2xl"
                >
                  <h3 className="text-xl font-semibold text-white mb-4">
                    {shader.title}
                  </h3>
                  <div className="text-2xl font-bold text-teal-400">
                    ${shader.price}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
