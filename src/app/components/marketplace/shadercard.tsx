"use client";

import { LuCirclePlus, LuHeart } from "react-icons/lu";
import { addToCart } from "@/lib/cart/actions";
import { useState } from "react";

type ShaderCardProps = {
  id: string;
  title: string;
  price: number;
  likes: number;
};

export default function ShaderCard({
  id,
  title,
  price,
  likes = 0,
}: ShaderCardProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);

  const toggleLike = () => {
    if (liked) {
      setLiked(false);
      setLikeCount((prev) => prev - 1);
    } else {
      setLiked(true);
      setLikeCount((prev) => prev + 1);
    }
  };

  return (
    <div className="glass glass-border p-6 rounded-2xl relative">
      <h3 className="text-xl font-semibold text-white mb-4">{title}</h3>
      <img
        src="https://redthread.uoregon.edu/files/original/affd16fd5264cab9197da4cd1a996f820e601ee4.png"
        alt="Shader preview"
        className="w-full h-auto my-2 rounded-lg"
      />
      <h3 className="text-2xl font-bold text-teal-400">${price}</h3>

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          <button
            onClick={toggleLike}
            type="button"
            className="text-white hover:text-purple-500 "
          >
            <LuHeart
              className={`w-6 h-6 ${liked ? "fill-purple-500 text-purple-500" : ""}`}
            />
          </button>
          <span className="text-white text-base">{likeCount}</span>
        </div>
        <form action={addToCart}>
          <input type="hidden" name="shaderId" value={id} />
          <button
            type="submit"
            className="absolute bottom-4 right-4 flex items-center justify-center 
                      w-8 h-8 rounded-md
                      transition-colors shadow-md cursor-pointer"
          >
            <LuCirclePlus className="text-white hover:text-purple-500 w-7 h-7" />
          </button>
        </form>
      </div>
    </div>
  );
}
