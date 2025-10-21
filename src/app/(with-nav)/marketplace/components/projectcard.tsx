import Image from "next/image";
import { LuCircleCheckBig, LuDownload, LuPlus } from "react-icons/lu";

import { Button } from "@/ui/button";
import { addToCart, addToCartProject } from "../../marketplace/cart.actions";

type ProjectCardProps = {
  id: string;
  name: string;
  description: string;
  price: number;
  downloads: number;
  inCart: boolean;
  username?: string;
  createdAt: string;
};

export default function ProjectCard({
  id,
  name,
  downloads,
  price,
  inCart,
  username,
  createdAt,
}: ProjectCardProps) {
  const isNew =
    Date.now() - new Date(createdAt).getTime() < 7 * 24 * 60 * 60 * 1000;
  return (
    <div className="glass glass-border p-4 rounded-2xl relative">
      {isNew && (
        <div className="absolute top-4 right-4 bg-red-800 text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg">
          NEW
        </div>
      )}
      <div className="text-xl font-semibold text-white mb-1">{name}</div>
      {username && (
        <>
          <p className="text-sm text-white/60 mb-2">
            by <span className="font-bold">{username}</span>
          </p>
          <p className="inline-block text-sm text-fuchsia-400 border border-current/15 font-semibold rounded-lg items-center justify-center gap-2 py-1 px-2 mr-2">
            Project
          </p>
        </>
      )}

      <Image
        src="/placeholder.webp"
        width={1000}
        height={667}
        alt="Shader preview"
        className="w-full aspect-[3/2] object-cover my-5 rounded-lg grayscale-100"
      />

      <div className="flex flex-row gap-3">
        <div className="grow text-2xl font-bold text-teal-400">${price}</div>
        <div className="flex flex-row items-center gap-1 text-white/60">
          <LuDownload /> {downloads}
        </div>
      </div>

      <div className="mt-2">
        {inCart ? (
          <div className="flex justify-center items-center h-13.5 text-base/5 font-semibold text-white rounded-lg border border-current/15 select-none">
            <LuCircleCheckBig className="inline mr-2 text-emerald-600" />
            In cart
          </div>
        ) : (
          <form action={addToCartProject}>
            <input type="hidden" name="projectId" value={id} />
            <Button
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
  );
}
