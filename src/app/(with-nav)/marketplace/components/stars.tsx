"use client";

import { LuStar, LuStarHalf } from "react-icons/lu";

type StarRatingProps = {
  ratingValue: number | null | undefined;
  ratingCount: number | null | undefined;
};

export function Stars({ ratingValue, ratingCount }: StarRatingProps) {
  const rating = Math.max(0, Math.min(ratingValue ?? 0, 5));
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStar;

  return (
    <div className="flex items-center gap-1">
      {Array(fullStars)
        .fill(0)
        .map((_, idx) => (
          <div key={`full-${idx}`} className="relative w-5 h-5">
            <LuStar className="absolute text-white/60 w-5 h-5" />
            <div className="overflow-hidden h-full">
              <LuStar className="text-yellow-400 w-5 h-5" />
            </div>
          </div>
        ))}
      {halfStar === 1 && (
        <div className="relative w-5 h-5">
          <LuStar className="absolute text-white/60 w-5 h-5" />
          <div className="overflow-hidden w-1/2 h-full">
            <LuStarHalf className="text-yellow-400 w-5 h-5" />
          </div>
        </div>
      )}
      {Array(emptyStars)
        .fill(0)
        .map((_, idx) => (
          <LuStar key={`empty-${idx}`} className="text-white/60 w-5 h-5" />
        ))}
      <p className="flex items-center justify-bottom text-center text-xs text-white/60 ml-1">
        ({ratingCount} ratings)
      </p>
    </div>
  );
}
