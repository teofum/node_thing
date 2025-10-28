import { Dialog } from "@/ui/dialog";
import RatingEditor from "../dialogs/rating-editor";
import { Button } from "@/ui/button";
import { Stars } from "@/app/(with-nav)/marketplace/components/stars";
import { RatingsDisplay } from "./items-tab";
import { CardBadge } from "../../marketplace/components/card-badge";

type RatingCardProps = {
  id: string;
  type: "shader" | "project";
  title: string;
  category?: string | null;
  averageRating?: number | null;
  userRating: RatingsDisplay | null;
  ratingCount: number | null;
};

export default function RatingCard({
  id,
  type,
  title,
  category,
  averageRating,
  userRating,
  ratingCount,
}: RatingCardProps) {
  return (
    <div className="glass glass-border p-4 rounded-2xl">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>

      <div className="mb-7">
        <CardBadge
          text={type.charAt(0).toUpperCase() + type.slice(1)}
          color={
            type === "shader"
              ? "blue"
              : type === "project"
                ? "fuchsia"
                : "black"
          }
        />
        {type === "shader" && category && (
          <CardBadge text={category} color="teal" />
        )}
      </div>

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
          type={type}
          title={title}
          category={category}
          userRating={userRating}
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
