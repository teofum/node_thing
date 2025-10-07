"use client";

import { ComponentProps } from "react";
import { Dialog } from "@/ui/dialog";
import RatingEditor from "../rating-editor";
import { UserRatingsDisplay } from "../page";
import { Button } from "@/ui/button";
import { Stars } from "@/app/(with-nav)/marketplace/components/stars";

type RatingCardProps = {
  id: string;
  title: string;
  category: string;
  averageRating?: number | null;
  userRating: UserRatingsDisplay | null;
  ratingCount: number | null;
  trigger: ComponentProps<typeof Dialog>["trigger"];
};

export default function RatingCard({
  id,
  title,
  category,
  averageRating,
  userRating,
  ratingCount,
  trigger,
}: RatingCardProps) {
  return (
    <div className="glass glass-border p-6 rounded-2xl">
      <h3 className="text-xl font-semibold text-white mb-1">{title}</h3>
      {category && (
        <p className="inline-block text-sm text-teal-400 border border-current/15 mb-4 font-semibold rounded-lg items-center justify-center gap-2  py-1 px-2">
          {category}
        </p>
      )}

      <Stars ratingValue={averageRating} ratingCount={ratingCount} />

      <div className="flex items-center justify-between mt-4">
        <div className=" max-w-[60%]">
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

        <RatingEditor
          key={id}
          id={id}
          title={title}
          category={category}
          initialRating={userRating?.rating ?? 0}
          initialComment={userRating?.comment ?? ""}
          trigger={
            <Button variant="outline" className="text-xs">
              {userRating ? "Edit review" : "Add review"}
            </Button>
          }
        />
      </div>
    </div>
  );
}
