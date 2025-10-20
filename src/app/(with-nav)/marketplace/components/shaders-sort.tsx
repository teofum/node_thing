"use client";

import { useState, useMemo } from "react";
import { SortMenubar } from "./sort-bar";
import ShaderCard from "./shadercard";
import ProjectCard from "./projectcard";

interface Shader {
  id: string;
  title: string;
  price: number;
  averageRating?: number | null;
  ratingCount?: number | null;
  downloads: number;
  createdAt: string;
  category: { name: string };
  profiles?: { username?: string };
}

interface Project {
  id: string;
  name: string | null;
  description: string | null;
  price: number | null;
  createdAt: string | null;
  profiles?: { username?: string };
}

export function ShaderListClient({
  shaders,
  cartIds,
  projects,
}: {
  shaders: Shader[];
  cartIds: Set<string>;
  projects: Project[];
}) {
  const [sortBy, setSortBy] = useState("price");
  const [ascending, setAscending] = useState(true);

  const sortedShaders = useMemo(() => {
    const sorted = [...shaders];
    sorted.sort((a, b) => {
      let valA, valB;

      switch (sortBy) {
        case "price":
          valA = a.price;
          valB = b.price;
          break;
        case "reviews":
          valA = a.averageRating ?? 0;
          valB = b.averageRating ?? 0;
          break;
        case "date":
          valA = new Date(a.createdAt).getTime();
          valB = new Date(b.createdAt).getTime();
        default:
          valA = a.downloads;
          valB = b.downloads;
      }
      return ascending ? valA - valB : valB - valA;
    });
    return sorted;
  }, [shaders, sortBy, ascending]);

  // TODO
  const sortedProjects = useMemo(() => {
    return projects.map((p) => ({
      ...p,
      name: p.name ?? "Untitled Project",
      description: p.description ?? "",
      price: p.price ?? 0,
      createdAt: p.createdAt ?? new Date().toISOString(),
      profiles: { username: p.profiles?.username ?? "" },
    }));
  }, [projects]);

  return (
    <>
      <SortMenubar
        onChange={(sort, asc) => {
          setSortBy(sort);
          setAscending(asc);
        }}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedShaders.map((shader) => (
          <ShaderCard
            key={shader.id}
            id={shader.id}
            title={shader.title}
            price={shader.price}
            downloads={shader.downloads}
            inCart={cartIds.has(shader.id)}
            username={shader.profiles?.username}
            category={shader.category.name}
            createdAt={shader.createdAt}
            averageRating={shader.averageRating}
            ratingCount={shader.ratingCount}
          />
        ))}
        {sortedProjects.map((project) => (
          <ProjectCard
            key={project.id}
            id={project.id}
            name={project.name}
            description={project.description}
            price={project.price}
            inCart={cartIds.has(project.id)}
            username={project.profiles?.username}
            createdAt={project.createdAt}
          />
        ))}
      </div>
    </>
  );
}
