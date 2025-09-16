import { LuCircleCheckBig, LuHeart, LuPlus } from "react-icons/lu";
import { addToCart } from "../../marketplace/cart/actions";
import { Button } from "@/ui/button";

type ShaderCardProps = {
  id: string;
  title: string;
  price: number;
  likes: number;
  inCart: boolean;
  username?: string;
};

export default function ShaderCard({
  id,
  title,
  price,
  likes = 0,
  inCart,
  username,
}: ShaderCardProps) {
  return (
    <div className="glass glass-border p-6 rounded-2xl relative">
      <h3 className="text-xl font-semibold text-white mb-1">{title}</h3>
      {username && (
        <p className="text-sm text-neutral-400 mb-4">by {username}</p>
      )}
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
        {inCart ? (
          <div className="p-4 text-base/5 font-semibold text-white rounded-lg">
            <LuCircleCheckBig className="inline mr-2 text-emerald-600" />
            In cart
          </div>
        ) : (
          <form action={addToCart}>
            <input type="hidden" name="shaderId" value={id} />
            <Button
              size="lg"
              variant="outline"
              className="text-emerald-600"
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
