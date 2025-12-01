"use client";

import { LuStar } from "react-icons/lu";
import {
  ComponentProps,
  startTransition,
  useActionState,
  useState,
} from "react";
import {
  deleteReview,
  submitReview,
} from "@/app/(with-nav)/profile/actions/private";
import { Dialog, DialogClose } from "@/ui/dialog";
import { Button } from "@/ui/button";
import { RatingsDisplay } from "../components/items-tab";

type RatingEditorProps = {
  id: string;
  type: "shader" | "project";
  title: string;
  category?: string | null;
  userRating: RatingsDisplay | null;
  trigger: ComponentProps<typeof Dialog>["trigger"];
};

export default function RatingEditor({
  id,
  type,
  title,
  category,
  userRating,
  trigger,
}: RatingEditorProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [rating, setRating] = useState(userRating?.rating ?? 0);
  const [comment, setComment] = useState(userRating?.comment ?? "");
  const stars = [1, 2, 3, 4, 5];

  // TODO pending behaviour
  const [submitReviewState, submitReviewAction, submitReviewPending] =
    useActionState(
      async () => await submitReview(type, id, rating, comment),
      null,
    );

  // TODO pending behaviour
  const [deleteReviewState, deleteReviewAction, deleteReviewPending] =
    useActionState(async () => await deleteReview(type, id), null);

  const isPending = submitReviewPending || deleteReviewPending;

  return (
    <Dialog trigger={trigger} title={title} description={category}>
      <div className="p-4 flex flex-col gap-4">
        <div className="flex gap-1">
          {stars.map((star) => {
            const isActive =
              hovered !== null ? star <= hovered : star <= rating;
            return (
              <LuStar
                key={star}
                className={`w-6 h-6 cursor-pointer ${isActive ? "text-yellow-400" : "text-white/50"}`}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => setRating(star)}
              />
            );
          })}
        </div>
        <textarea
          className="font-mono text-sm/4 resize-none max-w-full w-full max-h-full h-full min-h-80 outline-none p-2 rounded-lg bg-black/70 border border-white/15"
          placeholder="Write your review..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
        />
        <div className="flex flex-row gap-2">
          {userRating && (
            <Button
              onClick={() => startTransition(() => deleteReviewAction())}
              className="mt-3 text-red-400"
              disabled={isPending}
            >
              {deleteReviewPending ? "Deleting..." : "Delete Review"}
            </Button>
          )}

          <Button
            onClick={() => startTransition(() => submitReviewAction())}
            className="mt-3 ml-auto"
            disabled={isPending}
          >
            {submitReviewPending ? "Submitting..." : "Submit Review"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
