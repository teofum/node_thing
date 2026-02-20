import { LuGitFork, LuPlus, LuSearch } from "react-icons/lu";

import { Button, LinkButton } from "@/ui/button";
import { getCategories, getItems } from "./actions";
import { ShaderListClient } from "./components/items-sort";
import { Input } from "@/ui/input";
import { getUserData } from "../profile/actions/user";
import { getPurchasedProjects, getPurchasedShaders } from "@/app/actions";

type Props = {
  searchParams: Promise<{
    error?: string;
    category?: string | string[];
    search?: string;
    type?: string | string[];
  }>;
};

export default async function MarketplacePage({ searchParams }: Props) {
  const params = await searchParams;
  const { shaders, projects } = await getItems();
  const categories = await getCategories();
  const purchasedShaders = await getPurchasedShaders();
  const purchasedProjects = await getPurchasedProjects();
  const userData = await getUserData();
  const ownedIds = new Set<string>([
    ...purchasedShaders
      .map((shader) => shader?.id)
      .filter((id): id is string => id !== null),

    ...purchasedProjects
      .map((project) => project?.id)
      .filter((id): id is string => id !== null),
  ]);

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

  let filteredProjects = projects;
  if (searchTerm) {
    const searchLower = searchTerm.toLowerCase().trim();
    filteredProjects = filteredProjects.filter(
      (project) =>
        (project.title && project.title.toLowerCase().includes(searchLower)) ||
        (project.description &&
          project.description.toLowerCase().includes(searchLower)),
    );
  }

  if (!selectedTypes.includes("shader")) filteredShaders = [];
  if (!selectedTypes.includes("project")) filteredProjects = [];

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Marketplace</h1>
            <p className="text-white/60 mt-2">
              Discover and share amazing shaders
            </p>
          </div>
          <div className="flex gap-4 items-center">
            <LinkButton href={`/profile/${userData.username}`}>
              <LuGitFork />
              Library
            </LinkButton>
            <LinkButton href="/marketplace/upload">
              <LuPlus />
              Create
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
          <Input
            type="text"
            name="search"
            defaultValue={searchTerm || ""}
            placeholder="Search shaders..."
            className="w-full"
          />
          <Button
            type="submit"
            variant="ghost"
            size="md"
            className="absolute right-4 top-1.5 text-white/60 hover:text-white transition-colors"
            icon
          >
            <LuSearch size={20} />
          </Button>

          {/* <div className="mt-4">
            Deleted RangeSliderInput for price
          </div> */}
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
            <p className="text-white/60">
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
            ownedIds={ownedIds}
            currentUsername={userData.username}
          />
        )}
      </div>
    </div>
  );
}
