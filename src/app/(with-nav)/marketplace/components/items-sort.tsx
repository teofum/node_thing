"use client";

import { useState, useMemo } from "react";
import { SortMenubar } from "./sort-bar";
import ItemCard from "./itemcard";

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
  title: string;
  description: string | null;
  price: number | null;
  downloads: number | null;
  createdAt: string | null;
  profiles?: { username?: string };
  averageRating?: number | null;
  ratingCount?: number | null;
}

function mixSortedLists(
  sortedShaders: Shader[],
  sortedProjects: Project[],
  sortBy: string,
  ascending: boolean,
) {
  const mixed: (Shader | Project)[] = [];

  const comparable = ["price", "reviews", "date", "downloads"];

  if (!comparable.includes(sortBy)) {
    return [...sortedShaders, ...sortedProjects];
  }

  let i = 0,
    j = 0;
  while (i < sortedShaders.length && j < sortedProjects.length) {
    const s = sortedShaders[i];
    const p = sortedProjects[j];

    let sValue: number, pValue: number;

    switch (sortBy) {
      case "price":
        sValue = s.price ?? 0;
        pValue = p.price ?? 0;
        break;
      case "reviews":
        sValue = s.averageRating ?? 0;
        pValue = 0;
        break;
      case "date":
        sValue = new Date(s.createdAt).getTime();
        pValue = new Date(p.createdAt ?? "").getTime();
        break;
      case "downloads":
        sValue = s.downloads ?? 0;
        pValue = p.downloads ?? 0;
        break;
      default:
        sValue = 0;
        pValue = 0;
    }

    const compare = sValue - pValue;
    if ((ascending && compare <= 0) || (!ascending && compare >= 0)) {
      mixed.push(s);
      i++;
    } else {
      mixed.push(p);
      j++;
    }
  }

  while (i < sortedShaders.length) mixed.push(sortedShaders[i++]);
  while (j < sortedProjects.length) mixed.push(sortedProjects[j++]);

  return mixed;
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

  const sortedProjects = useMemo(() => {
    const mapped = projects.map((p) => ({
      ...p,
      name: p.title ?? "Untitled Project",
      description: p.description ?? "",
      price: p.price ?? 0,
      createdAt: p.createdAt ?? new Date().toISOString(),
      profiles: { username: p.profiles?.username ?? "" },
    }));

    mapped.sort((a, b) => {
      let valA, valB;

      switch (sortBy) {
        case "price":
          valA = a.price ?? 0;
          valB = b.price ?? 0;
          break;
        case "date":
          valA = new Date(a.createdAt!).getTime();
          valB = new Date(b.createdAt!).getTime();
          break;
        case "downloads":
          valA = a.downloads ?? 0;
          valB = b.downloads ?? 0;
          break;
        default:
          valA = 0;
          valB = 0;
      }

      return ascending ? valA - valB : valB - valA;
    });

    return mapped;
  }, [projects, sortBy, ascending]);

  const finalList = useMemo((): (Shader | Project)[] => {
    return mixSortedLists(sortedShaders, sortedProjects, sortBy, ascending);
  }, [sortedShaders, sortedProjects, sortBy, ascending]);

  return (
    <>
      <SortMenubar
        onChange={(sort, asc) => {
          setSortBy(sort);
          setAscending(asc);
        }}
      />
      <div className="grid grid-cols-[repeat(auto-fill,minmax(18rem,1fr))] gap-4">
        {finalList.map((item) =>
          "category" in item ? (
            <ItemCard
              itemType="Shader"
              key={item.id}
              id={item.id}
              title={item.title}
              price={item.price}
              downloads={item.downloads}
              inCart={cartIds.has(item.id)}
              username={item.profiles?.username}
              category={item.category.name}
              createdAt={item.createdAt}
              averageRating={item.averageRating}
              ratingCount={item.ratingCount}
            />
          ) : (
            <ItemCard
              itemType="Project"
              key={item.id}
              id={item.id}
              title={item.title ?? "Untilted project"}
              price={item.price ?? 0}
              downloads={item.downloads ?? 0}
              inCart={cartIds.has(item.id)}
              username={item.profiles?.username}
              createdAt={item.createdAt ?? new Date().toISOString()}
              averageRating={item.averageRating}
              ratingCount={item.ratingCount}
            />
          ),
        )}
      </div>
    </>
  );
}
