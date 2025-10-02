"use client";

import { LuStar } from "react-icons/lu";
import { useState } from "react";
import { submitShaderRating } from "@/app/profile/actions";

type RatingShaderCardProps = {
  id: string;
  title: string;
  category: string;
  average_rating?: number | null;
};

export default function RatingShaderCard({
  id,
  title,
  category,
  average_rating,
}: RatingShaderCardProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [rating, setRating] = useState(average_rating ?? 0);

  const stars = [1, 2, 3, 4, 5];

  const handleClick = async (value: number) => {
    await submitShaderRating(id, value);

    setRating(value);
  };

  return (
    <div className="glass glass-border p-6 rounded-2xl">
      <h3 className="text-xl font-semibold text-white mb-1">{title}</h3>
      {category && (
        <p className="inline-block text-sm text-teal-400 border border-current/15 mb-4 font-semibold rounded-lg items-center justify-center gap-2  py-1 px-2">
          {category}
        </p>
      )}
      <div className="flex gap-1 mt-2">
        {stars.map((star) => {
          const isActive = hovered !== null ? star <= hovered : star <= rating;
          return (
            <LuStar
              key={star}
              className={`w-5 h-5 cursor-pointer ${
                isActive ? "text-yellow-400" : "text-gray-500"
              }`}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => handleClick(star)}
            />
          );
        })}
      </div>
    </div>
  );
}
