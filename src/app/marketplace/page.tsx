import { Button, LinkButton } from "@/ui/button";
import { LuArrowLeft, LuSearch, LuShoppingCart } from "react-icons/lu";
import { getShaders, getCategories } from "./actions";
import { getCartItems } from "./cart/actions";
import ShaderCard from "@/app/components/marketplace/shadercard";

type Props = {
  searchParams: Promise<{
    error?: string;
    category?: string | string[];
    search?: string;
  }>;
};

export default async function MarketplacePage({ searchParams }: Props) {
  const params = await searchParams;
  const shaders = params.error ? [] : await getShaders();
  const categories = await getCategories();
  const cartItems = await getCartItems();
  const cartIds = new Set(cartItems.map((item) => item.shader_id));

  // Filter by category and search from URL params to not use client-side
  const selectedCategories = Array.isArray(params.category)
    ? params.category
    : params.category
      ? [params.category]
      : [];
  const searchTerm = params.search;

  let filteredShaders =
    selectedCategories.length > 0
      ? shaders.filter(
          (shader) =>
            shader.category?.name &&
            selectedCategories.includes(shader.category.name),
        )
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
      <LinkButton
        variant="ghost"
        href="/"
        size="md"
        className="absolute top-4 left-4"
      >
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
              <LinkButton
                href="/marketplace/cart"
                variant="outline"
                size="lg"
                icon
              >
                <LuShoppingCart />
              </LinkButton>
              <LinkButton
                href="/marketplace/upload"
                variant="default"
                size="lg"
              >
                Upload Shader
              </LinkButton>
            </div>
          </div>

          <form method="GET" className="relative mb-10 max-w-3xl mx-auto">
            {selectedCategories.map((category) => (
              <input
                key={category}
                type="hidden"
                name="category"
                value={category}
              />
            ))}
            <input
              type="text"
              name="search"
              defaultValue={searchTerm || ""}
              placeholder="Search shaders..."
              className="w-full rounded-full bg-neutral-800 text-white px-5 py-3 pr-12
                         border border-neutral-700 placeholder-neutral-500 focus:outline-none
                         focus:ring-2 focus:ring-purple-500"
            />
            <Button
              type="submit"
              variant="ghost"
              size="md"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors"
              icon
            >
              <LuSearch size={20} />
            </Button>
          </form>

          <div className="mb-6 flex justify-center gap-2 flex-wrap">
            <LinkButton
              href={
                searchTerm
                  ? `/marketplace?search=${encodeURIComponent(searchTerm)}`
                  : "/marketplace"
              }
              variant="outline"
              data-state={selectedCategories.length === 0 ? "on" : "off"}
            >
              All
            </LinkButton>
            {categories.map((category) => {
              const isSelected = selectedCategories.includes(category.name);
              const otherCategories = selectedCategories.filter(
                (c) => c !== category.name,
              );
              const newCategories = isSelected
                ? otherCategories
                : [...selectedCategories, category.name];

              const categoryParams = new URLSearchParams();
              if (searchTerm) categoryParams.set("search", searchTerm);
              newCategories.forEach((cat) =>
                categoryParams.append("category", cat),
              );

              const categoryUrl = `/marketplace${categoryParams.toString() ? "?" + categoryParams.toString() : ""}`;

              return (
                <LinkButton
                  key={category.id}
                  href={categoryUrl}
                  variant="outline"
                  data-state={isSelected ? "on" : "off"}
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
                {searchTerm && selectedCategories.length > 0
                  ? `No shaders found for "${searchTerm}" in ${selectedCategories.join(", ")} categories` // both filters active
                  : searchTerm
                    ? `No shaders found for "${searchTerm}"` // only search active
                    : selectedCategories.length > 0
                      ? `No shaders found in ${selectedCategories.join(", ")} categories` // only category active
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
                  inCart={cartIds.has(shader.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
