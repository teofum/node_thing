import { ComponentProps, useMemo } from "react";

import { ImageAsset } from "@/store/asset-store";
import { imageURLFromAsset } from "@/utils/image-url-from-asset";

type Props = ComponentProps<"div"> & {
  name: string;
  asset: ImageAsset;
};

export function AssetThumbnail({ name, asset, children, ...props }: Props) {
  const imageUrl = useMemo(() => imageURLFromAsset(asset), [asset]);

  return (
    <div
      key={name}
      className="relative flex flex-col rounded-lg border border-white/15 overflow-hidden group/asset"
      {...props}
    >
      <div className="absolute bottom-0 left-0 right-0 p-1 text-xs/3 bg-black/40 backdrop-blur-md opacity-0 group-hover/asset:opacity-100 transition-opacity duration-150">
        {name}
      </div>
      {/* We don't care about nextjs image optimization here, it's a local data url */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt=""
        className="aspect-square object-cover bg-pattern-squares bg-neutral-950 text-neutral-900"
        src={imageUrl}
      />
      {children}
    </div>
  );
}
