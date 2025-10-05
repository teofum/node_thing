"use client";

import { useState, useMemo } from "react";
import { SortMenubar } from "./sort-bar";
import ShaderCard from "@/app/components/marketplace/shadercard";

interface Shader {
  id: string;
  title: string;
  price: number;
  average_rating?: number;
  created_at: string;
  category: { name: string };
  profiles?: { username?: string };
}

export function ShaderListClient({
  shaders,
  cartIds,
}: {
  shaders: Shader[];
  cartIds: Set<string>;
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
          valA = a.average_rating ?? 0;
          valB = b.average_rating ?? 0;
          break;
        default:
          valA = new Date(a.created_at).getTime();
          valB = new Date(b.created_at).getTime();
      }
      return ascending ? valA - valB : valB - valA;
    });
    return sorted;
  }, [shaders, sortBy, ascending]);

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
            likes={0}
            inCart={cartIds.has(shader.id)}
            username={shader.profiles?.username}
            category={shader.category.name}
            createdAt={shader.created_at}
          />
        ))}
      </div>
    </>
  );
}
