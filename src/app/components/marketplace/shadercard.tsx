import { LuCircleCheckBig, LuDownload, LuPlus } from "react-icons/lu";
import { addToCart } from "../../marketplace/cart/actions";
import { Button } from "@/ui/button";
import { Stars } from "./stars";

type ShaderCardProps = {
  id: string;
  title: string;
  price: number;
  downloads: number;
  inCart: boolean;
  username?: string;
  category: string;
  createdAt: string;
  averageRating?: number | null;
  ratingCount?: number | null;
};

export default function ShaderCard({
  id,
  title,
  price,
  downloads,
  inCart,
  username,
  category,
  createdAt,
  averageRating,
  ratingCount,
}: ShaderCardProps) {
  const isNew =
    Date.now() - new Date(createdAt).getTime() < 7 * 24 * 60 * 60 * 1000;
  return (
    <div className="glass glass-border p-6 rounded-2xl relative">
      {isNew && (
        <div className="absolute top-4 right-4 bg-red-800 text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg">
          NEW
        </div>
      )}
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

      <div className="flex items-center justify-between mt-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <LuDownload className="w-6 h-6" />
            <span className="text-white text-base">{downloads}</span>
          </div>
          <Stars ratingValue={averageRating} ratingCount={ratingCount} />
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
