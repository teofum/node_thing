import { LinkButton } from "@/ui/button";
import { LuArrowLeft, LuSearch } from "react-icons/lu";
import { getShaders } from "@/lib/marketplace/actions";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ShaderCard from "@/app/components/marketplace/shadercard";

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
            <div className="flex gap-4">
              <LinkButton href="/marketplace/cart" variant="outline">
                Cart
              </LinkButton>
              <LinkButton href="/marketplace/upload">Upload Shader</LinkButton>
            </div>
          </div>

          <div className="relative mb-10 max-w-3xl mx-auto">
            <input
              type="text"
              placeholder="Search shaders..."
              className="w-full rounded-full bg-neutral-800 text-white px-5 py-3 pr-12
                         border border-neutral-700 placeholder-neutral-500 focus:outline-none
                         focus:ring-2 focus:ring-purple-500"
            />
            <LuSearch
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-neutral-400"
              size={20}
            />
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
                <ShaderCard
                  key={shader.id}
                  id={shader.id}
                  title={shader.title}
                  price={shader.price}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
