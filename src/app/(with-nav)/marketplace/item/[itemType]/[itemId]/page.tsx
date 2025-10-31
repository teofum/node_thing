import { LuCircleCheckBig, LuDownload, LuPlus } from "react-icons/lu";
import { CardBadge } from "../../../components/card-badge";

import Image from "next/image";
import { getItem } from "../../actions";
import { Button } from "@/ui/button";
import { Stars } from "../../../components/stars";
import { addToCart } from "@/app/(with-nav)/marketplace/cart.actions";

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
    <div className="p-8 max-w-6xl mx-auto">
      {/*<p>TODO</p>*/}
      {/*<p>{itemType}</p>*/}
      {/*<p>{itemId}</p>*/}

      {/*Grid parte superior*/}
      <div className="grid md:grid-cols-2 gap-8 items-center">
        {/*Columna izq*/}
        <div>
          <div className="text-3xl font-semibold mb-1">{item.title}</div>
          {item.username && (
            <p className="text-2x1 text-white/60 mb-2">
              by <span className="font-bold">{item.username}</span>
            </p>
          )}

          {/* TODO descripcion de item */}
          <div className="mt-6">
            <p className="text-sm mb-2">User did not upload any description</p>
          </div>

          <div className="mt-20">
            <p className="text-2x1 mb-2"> Categories:</p>
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
          </div>

          {/* TODO preview de shader o proyecto (preguntar cómo hacer con renderer) */}

          <div className="flex flex-row gap-3 mt-4">
            <div className="grow text-2xl font-bold text-teal-400">
              Price: ${item.price}
            </div>
          </div>

          <div className="flex flex-row items-center gap-1 text-white/60 mt-2">
            <div className="flex flex-row items-center gap-1 text-white/60 mx-2">
              <LuDownload /> {item.downloads}
            </div>
            <div>
              <Stars
                ratingValue={item.ratingcount}
                ratingCount={item.ratingcount}
              />
            </div>
          </div>

          {/*Add to Cart*/}
          <div className="mt-2">
            {item.incart ? (
              <div className="flex justify-center items-center h-13.5 text-base/5 font-semibold rounded-lg border border-current/15 select-none">
                <LuCircleCheckBig className="inline mr-2 text-emerald-600" />
                In cart
              </div>
            ) : (
              <form action={addToCart}>
                <input type="hidden" name="itemId" value={item.id} />
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
          </div>
        </div>

        {/*Columna izq*/}
        <div className="flex flex-col items-center">
          <div className="w-full rounded-2xl overflow-hidden">
            <Image
              src="/placeholder.webp"
              width={1000}
              height={667}
              alt={"${item.title} preview"}
              className="w-full aspect-[3/2] object-cover my-5 rounded-lg grayscale-100"
            />
          </div>
        </div>
      </div>

      <div>
        <div className="text-3xl font-semibold mb-1 mt-8">User Reviews:</div>
      </div>
    </div>
  );
}
