import { LuCircleCheckBig, LuDownload, LuPlus } from "react-icons/lu";
import { CardBadge } from "../../../components/card-badge";

import { getItem } from "../../actions";
import { Button } from "@/ui/button";
import { Stars } from "../../../components/stars";

type ItemDetailPageProps = {
  params: {
    itemType: "shader" | "project";
    itemId: string;
  };
};

export default async function ItemDetailPage({ params }: ItemDetailPageProps) {
  const { itemType, itemId } = params;

  const item = await getItem(itemId, itemType);

  const isNew =
    Date.now() - new Date(item.createdat).getTime() < 7 * 24 * 60 * 60 * 1000;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <p>TODO</p>
      <p>{itemType}</p>
      <p>{itemId}</p>

      <div className="glass glass-border p-4 rounded-2xl relative">
        {isNew && (
          <div className="absolute top-4 right-4 bg-red-800 text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg">
            NEW
          </div>
        )}
        <div className="text-xl font-semibold mb-1">{item.title}</div>
        {item.username && (
          <>
            <p className="text-sm text-white/60 mb-2">
              by <span className="font-bold">{item.username}</span>
            </p>
            <CardBadge
              text={itemType}
              color={
                itemType === "shader"
                  ? "blue"
                  : itemType === "project"
                    ? "fuchsia"
                    : "black"
              }
            />
            {itemType === "shader" && item.category && (
              <CardBadge text={item.category.toString()} color="teal" />
            )}
          </>
        )}
        {/* TODO preview de shader o proyecto (preguntar cómo hacer con renderer) */}

        <div className="flex flex-row gap-3">
          <div className="grow text-2xl font-bold text-teal-400">
            ${item.price}
          </div>
          <div className="flex flex-row items-center gap-1 text-white/60">
            <LuDownload /> {item.downloads}
          </div>
          <Stars
            ratingValue={item.ratingcount}
            ratingCount={item.ratingcount}
          />
        </div>

        {/* TODO agregar manejo de carrito */}

        {/* <div className="mt-2">
        {inCart ? (
          <div className="flex justify-center items-center h-13.5 text-base/5 font-semibold rounded-lg border border-current/15 select-none">
            <LuCircleCheckBig className="inline mr-2 text-emerald-600" />
            In cart
          </div>
        ) : (
          <form action={addToCart}>
            <input type="hidden" name="itemId" value={id} />
            <input
              type="hidden"
              name="itemType"
              value={itemType.toLocaleLowerCase()}
            />
            <Button
              type="submit"
              size="lg"
              variant="outline"
              className="flex items-center text-emerald-600 w-full"
            >
              <LuPlus />
              Add to cart
            </Button>
          </form>
        )}
      </div> */}
      </div>
    </div>
  );
}
