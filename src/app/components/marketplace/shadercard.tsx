import { LuCircleCheckBig, LuHeart, LuPlus } from "react-icons/lu";
import { addToCart } from "../../marketplace/cart/actions";
import { Button } from "@/ui/button";

type ShaderCardProps = {
  id: string;
  title: string;
  price: number;
  likes: number;
  inCart: boolean;
};

export default function ShaderCard({
  id,
  title,
  price,
  likes = 0,
  inCart,
}: ShaderCardProps) {
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
          <Button
            icon
            variant="ghost"
            disabled
            className="text-white cursor-default"
          >
            <LuHeart className="w-6 h-6" />
          </Button>
          <span className="text-white text-base">{likes}</span>
        </div>
        <form action={inCart ? undefined : addToCart}>
          <input type="hidden" name="shaderId" value={id} />
          {inCart ? (
            <button
              type="button"
              className="inline-flex items-center gap-2 px-3 py-1 text-lg text-white rounded-md bg-emerald-600 
                        shadow-md cursor-default"
            >
              <LuCircleCheckBig /> In cart
            </button>
          ) : (
            <button
              type="submit"
              className="inline-flex items-center gap-1 px-3 py-1 text-lg border border-emerald-600 text-white rounded-md 
                         hover:bg-emerald-600 active:bg-emerald-700 transition-colors shadow-md cursor-pointer"
            >
              <LuPlus />
              Add to cart
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
