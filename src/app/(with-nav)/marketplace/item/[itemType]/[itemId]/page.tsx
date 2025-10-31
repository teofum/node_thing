import { LuCircleCheckBig, LuDownload, LuPlus } from "react-icons/lu";
import { CardBadge } from "../../../components/card-badge";

import Image from "next/image";
import { getItem, getReviews } from "../../actions";
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

  const reviews = await getReviews(itemId, itemType);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="grid md:grid-cols-2 gap-8 items-center">
        {/*Left column*/}
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

        {/*Right column*/}
        <div>
          <div className="text-3xl font-semibold mb-1">{item.title}</div>
          {item.username && (
            <p className="text-2x1 text-white/60 mb-2">
              by <span className="font-bold">{item.username}</span>
            </p>
          )}

          <div className="mt-2">
            <CardBadge
              text={itemType.charAt(0).toUpperCase() + itemType.slice(1)}
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

          <div className="mt-8 italic">
            {item.description ? (
              <p className="text-sm mb-2">{item.description}</p>
            ) : (
              <p className="text-sm mb-2">
                User did not upload any description...
              </p>
            )}
          </div>

          {/* TODO preview de shader o proyecto (subir foto) */}

          <div className="flex flex-row gap-3 mt-30">
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
      </div>

      {/*Reviews*/}
      <div>
        <div className="text-lg font-semibold mb-1 mt-10">User Reviews:</div>

        {reviews.length === 0 ? (
          <p className="text-white/60 mt-2">No reviews yet</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 mt-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="border border-white/10 rounded-xl p-4 bg-white/5"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">
                    {review.profiles?.username}
                  </span>
                  <Stars ratingValue={review.rating} ratingCount={null} />
                </div>
                {review.comment ? (
                  <p className="text-sm text-white/80 italic">
                    {review.comment}
                  </p>
                ) : (
                  <p className="text-sm text-white/40 italic">
                    No comment provided...
                  </p>
                )}
                <p className="text-xs text-white/40 mt-2">
                  {new Date(review.createdAt ?? "").toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
