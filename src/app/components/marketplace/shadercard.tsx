import {
  LuCircleCheckBig,
  LuHeart,
  LuPlus,
  LuStar,
  LuStarHalf,
} from "react-icons/lu";
import { addToCart } from "../../marketplace/cart/actions";
import { Button } from "@/ui/button";

type ShaderCardProps = {
  id: string;
  title: string;
  price: number;
  inCart: boolean;
  username?: string;
  category: string;
  average_rating?: number | null;
  rating_count?: number | null;
};

export default function ShaderCard({
  id,
  title,
  price,
  inCart,
  username,
  category,
  average_rating,
  rating_count,
}: ShaderCardProps) {
  const rating = Math.max(0, Math.min(average_rating ?? 0, 5));
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStar;

  return (
    <div className="glass glass-border p-6 rounded-2xl relative">
      <h3 className="text-xl font-semibold text-white mb-1">{title}</h3>
      {username && (
        <>
          <p className="text-sm text-white/60 mb-2">
            by <span className="font-bold">{username}</span>
          </p>
          {category && (
            <p className="inline-block text-sm text-teal-400 border border-current/15 mb-4 font-semibold rounded-lg items-center justify-center gap-2  py-1 px-2">
              {category}
            </p>
          )}
        </>
      )}
      <img
        src="https://redthread.uoregon.edu/files/original/affd16fd5264cab9197da4cd1a996f820e601ee4.png"
        alt="Shader preview"
        className="w-full h-auto my-2 rounded-lg"
      />
      <h3 className="text-2xl font-bold text-teal-400">${price}</h3>

      <div className="flex items-center justify-between">
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
          <p className="flex items-center justify-bottom text-center text-xs text-gray-500  ml-1">
            ({rating_count} ratings)
          </p>
        </div>
        {inCart ? (
          <div className="flex items-center p-3 text-base/5 font-semibold text-white rounded-lg">
            <LuCircleCheckBig className="inline mr-2 text-emerald-600" />
            In cart
          </div>
        ) : (
          <form action={addToCart}>
            <input type="hidden" name="shaderId" value={id} />
            <Button
              size="md"
              variant="outline"
              className="flex items-center text-emerald-600 p-3"
              icon
            >
              <LuPlus />
              Add to cart
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
