"use client";

import { LuStar, LuStarHalf } from "react-icons/lu";
import { ComponentProps, useState } from "react";
import { submitShaderRating } from "@/app/profile/actions";
import { Dialog } from "@/ui/dialog";
import RatingEditor from "./rating-editor";
import { UserRatingsDisplay } from "./page";
import { Tables } from "@/lib/supabase/database.types";

type RatingCardProps = {
  id: string;
  title: string;
  category: string;
  average_rating?: number | null;
  userRating: UserRatingsDisplay | null;
  ratingCount: number | null;
  trigger: ComponentProps<typeof Dialog>["trigger"];
};

export default function RatingCard({
  id,
  title,
  category,
  average_rating,
  userRating,
  ratingCount,
  trigger,
}: RatingCardProps) {
  const rating = Math.max(0, Math.min(average_rating ?? 0, 5));
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStar;

  return (
    <div className="glass glass-border p-6 rounded-2xl">
      <h3 className="text-xl font-semibold text-white mb-1">{title}</h3>
      {category && (
        <p className="inline-block text-sm text-teal-400 border border-current/15 mb-4 font-semibold rounded-lg items-center justify-center gap-2  py-1 px-2">
          {category}
        </p>
      )}

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

      <div className="flex items-center justify-between mt-4">
        <div className=" max-w-[65%]">
          {userRating ? (
            <>
              <p className="text-yellow-400 font-semibold text-xs">
                {userRating.rating}/5:
              </p>
              {userRating.comment && (
                <p className="text-white/80 mt-1 italic truncate">
                  “ {userRating.comment} ”&nbsp;
                </p>
              )}
            </>
          ) : (
            <p className="text-white/40 italic">No review yet</p>
          )}
        </div>

        {/* TODO ver si tengo que mandar todos estos props */}
        <RatingEditor
          key={id}
          id={id}
          title={title}
          category={category}
          average_rating={average_rating}
          trigger={trigger}
        />
      </div>
    </div>
  );
}
