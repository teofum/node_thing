"use client";

import { LuStar } from "react-icons/lu";
import { ComponentProps, useState } from "react";
import {
  deleteReview,
  submitReview,
} from "@/app/(with-nav)/profile/actions/items";
import { Dialog, DialogClose } from "@/ui/dialog";
import { Button } from "@/ui/button";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

  const handleSubmit = async () => {
    await submitReview(type, id, rating, comment);
    router.refresh();
  };

  const handleDelete = async () => {
    await deleteReview(type, id);
    router.refresh();
  };

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
                className={`w-6 h-6 cursor-pointer ${isActive ? "text-yellow-400" : "text-gray-500"}`}
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
            <DialogClose asChild>
              <Button onClick={handleDelete} className="mt-3 text-red-400">
                Delete Review
              </Button>
            </DialogClose>
          )}
          <DialogClose asChild>
            <Button onClick={handleSubmit} className="mt-3 ml-auto">
              Submit Review
            </Button>
          </DialogClose>
        </div>
      </div>
    </Dialog>
  );
}
