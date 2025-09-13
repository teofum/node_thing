import { LinkButton } from "@/ui/button";
import { LuArrowLeft, LuSearch } from "react-icons/lu";
import { getShaders, getCategories } from "@/lib/marketplace/actions";
import ShaderCard from "@/app/components/marketplace/shadercard";

type Props = {
  searchParams: Promise<{ error?: string; category?: string; search?: string }>;
};

export default async function MarketplacePage({ searchParams }: Props) {
  const params = await searchParams;
  const shaders = params.error ? [] : await getShaders();
  const categories = await getCategories();

  // Filter by category and search from URL params to not use client-side
  const selectedCategory = params.category;
  const searchTerm = params.search;

  let filteredShaders = selectedCategory
    ? shaders.filter((shader) => shader.category?.name === selectedCategory)
    : shaders;

  if (searchTerm) {
    const searchLower = searchTerm.toLowerCase().trim();
    filteredShaders = filteredShaders.filter(
      (shader) =>
        shader.title.toLowerCase().includes(searchLower) ||
        (shader.description &&
          shader.description.toLowerCase().includes(searchLower)),
    );
  }

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

          <form method="GET" className="relative mb-10 max-w-3xl mx-auto">
            {selectedCategory && (
              <input type="hidden" name="category" value={selectedCategory} />
            )}
            <input
              type="text"
              name="search"
              defaultValue={searchTerm || ""}
              placeholder="Search shaders..."
              className="w-full rounded-full bg-neutral-800 text-white px-5 py-3 pr-12
                         border border-neutral-700 placeholder-neutral-500 focus:outline-none
                         focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-white transition-colors"
            >
              <LuSearch size={20} />
            </button>
          </form>

          <div className="mb-6 flex justify-center gap-2 flex-wrap">
            <LinkButton
              href={
                searchTerm
                  ? `/marketplace?search=${encodeURIComponent(searchTerm)}`
                  : "/marketplace"
              }
              variant={!selectedCategory ? "default" : "outline"}
            >
              All
            </LinkButton>
            {categories.map((category) => {
              const categoryUrl = searchTerm
                ? `/marketplace?category=${category.name}&search=${encodeURIComponent(searchTerm)}`
                : `/marketplace?category=${category.name}`;

              return (
                <LinkButton
                  key={category.id}
                  href={categoryUrl}
                  variant={
                    selectedCategory === category.name ? "default" : "outline"
                  }
                >
                  {category.name}
                </LinkButton>
              );
            })}
          </div>

          {params.error ? (
            <div className="bg-red-900/20 border border-red-700 text-red-400 px-4 py-3 rounded mb-6">
              {decodeURIComponent(params.error)}
            </div>
          ) : filteredShaders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-neutral-400">
                {searchTerm && selectedCategory
                  ? `No shaders found for "${searchTerm}" in ${selectedCategory} category` // both filters active
                  : searchTerm
                    ? `No shaders found for "${searchTerm}"` // only search active
                    : selectedCategory
                      ? `No shaders found in ${selectedCategory} category` // only category active
                      : "No shaders yet. Be the first to upload one!"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredShaders.map((shader) => (
                <ShaderCard
                  key={shader.id}
                  id={shader.id}
                  title={shader.title}
                  price={shader.price}
                  likes={0}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
