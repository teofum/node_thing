import { LuSearch, LuShoppingCart } from "react-icons/lu";

import { Button, LinkButton } from "@/ui/button";
import { RangeSliderInput } from "@/ui/range-slider";
import { getCategories, getProjects, getShaders, getTypes } from "./actions";
import { getCartItems } from "./cart/actions";
import { ShaderListClient } from "./components/shaders-sort";

type Props = {
  searchParams: Promise<{
    error?: string;
    category?: string | string[];
    search?: string;
    minPrice?: string;
    maxPrice?: string;
    type?: string | string[];
  }>;
};

export default async function MarketplacePage({ searchParams }: Props) {
  const params = await searchParams;
  const shaders = params.error ? [] : await getShaders();
  const projects = await getProjects();
  const categories = await getCategories();
  const cartItems = await getCartItems();
  const types = await getTypes();
  const cartIds = new Set(cartItems.map((item) => item.shader_id));

  // Filter by category and search from URL params to not use client-side
  const selectedCategories = Array.isArray(params.category)
    ? params.category
    : params.category
      ? [params.category]
      : [];
  const searchTerm = params.search;

  const selectedTypes = Array.isArray(params.type)
    ? params.type
    : params.type
      ? [params.type]
      : ["shader", "project"];

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

  const minPrice = params.minPrice ? Number(params.minPrice) : 0;
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : Infinity;

  filteredShaders = filteredShaders.filter(
    (shader) => shader.price >= minPrice && shader.price <= maxPrice,
  );

  let filteredProjects = projects;
  if (searchTerm) {
    const searchLower = searchTerm.toLowerCase().trim();
    filteredProjects = filteredProjects.filter(
      (project) =>
        (project.name && project.name.toLowerCase().includes(searchLower)) ||
        (project.description &&
          project.description.toLowerCase().includes(searchLower)),
    );
  }

  filteredProjects = filteredProjects.filter(
    (project) =>
      project.price && project.price >= minPrice && project.price <= maxPrice,
  );

  if (!selectedTypes.includes("shader")) filteredShaders = [];
  if (!selectedTypes.includes("project")) filteredProjects = [];

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Marketplace</h1>
            <p className="text-neutral-400 mt-2">
              Discover and share amazing shaders
            </p>
          </div>
          <div className="flex gap-4 items-center">
            <LinkButton
              href="/marketplace/cart"
              variant="outline"
              size="lg"
              icon
            >
              <LuShoppingCart />
            </LinkButton>
            <LinkButton href="/marketplace/upload" variant="default" size="lg">
              Publish
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
                         focus:ring-1 focus:ring-purple-500 "
          />
          <Button
            type="submit"
            variant="ghost"
            size="md"
            className="absolute right-4 top-1.5  text-neutral-400 hover:text-white transition-colors"
            icon
          >
            <LuSearch size={20} />
          </Button>

          <div className="mt-4">
            <RangeSliderInput
              min={0}
              max={99000}
              step={1000}
              defaultMin={Number(params.minPrice) || 0}
              defaultMax={Number(params.maxPrice) || 99000}
              nameMin="minPrice"
              nameMax="maxPrice"
            />
          </div>
        </form>

        <div className="mb-6 flex justify-center gap-2 flex-wrap">
          {["shader", "project"].map((type) => {
            const isSelected = selectedTypes.includes(type);
            const remainingTypes = isSelected
              ? selectedTypes.filter((t) => t !== type)
              : [...selectedTypes, type];

            const newTypes =
              remainingTypes.length === 0 ? [type] : remainingTypes;

            const typeParams = new URLSearchParams();

            if (searchTerm) typeParams.set("search", searchTerm);
            selectedCategories.forEach((cat) =>
              typeParams.append("category", cat),
            );
            newTypes.forEach((t) => typeParams.append("type", t));
            if (params.minPrice) typeParams.set("minPrice", params.minPrice);
            if (params.maxPrice) typeParams.set("maxPrice", params.maxPrice);

            const typeUrl = `/marketplace${
              typeParams.toString() ? "?" + typeParams.toString() : ""
            }`;

            return (
              <LinkButton
                key={type}
                href={typeUrl}
                variant="outline"
                data-state={isSelected ? "on" : "off"}
              >
                {type === "shader" ? "Shader" : "Project"}
              </LinkButton>
            );
          })}
        </div>

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
        ) : filteredShaders.length === 0 && filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-neutral-400">
              {searchTerm && selectedCategories.length > 0
                ? `No results found for "${searchTerm}" in ${selectedCategories.join(", ")} categories` // both filters active
                : searchTerm
                  ? `No results found for "${searchTerm}"` // only search active
                  : selectedCategories.length > 0
                    ? `No results found in ${selectedCategories.join(", ")} categories` // only category active
                    : "No shaders or projects yet. Be the first to upload one!"}
            </p>
          </div>
        ) : (
          <ShaderListClient
            shaders={filteredShaders}
            projects={filteredProjects}
            cartIds={cartIds}
          />
        )}
      </div>
    </div>
  );
}
