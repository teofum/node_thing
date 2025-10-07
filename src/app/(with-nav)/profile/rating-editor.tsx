"use client";

import { LuStar } from "react-icons/lu";
import { ComponentProps, useState } from "react";
import { submitShaderReview } from "@/app/(with-nav)/profile/actions";
import { Dialog, DialogClose } from "@/ui/dialog";
import { Button } from "@/ui/button";

type RatingEditorProps = {
  id: string;
  title: string;
  category: string;
  initialRating?: number | null;
  initialComment?: string | null;
  trigger: ComponentProps<typeof Dialog>["trigger"];
};

export default function RatingEditor({
  id,
  title,
  category,
  initialRating = 0,
  initialComment,
  trigger,
}: RatingEditorProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [rating, setRating] = useState(initialRating ?? 0);
  const [comment, setComment] = useState(initialComment ?? "");
  const stars = [1, 2, 3, 4, 5];

  const handleSubmit = async () => {
    await submitShaderReview(id, rating, comment);
  };

  // TODO recuperar lo de hover de stars

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
        <DialogClose asChild>
          <Button onClick={handleSubmit} className="mt-3 justify-items-end">
            Submit Review
          </Button>
        </DialogClose>
      </div>
    </Dialog>
  );
}
