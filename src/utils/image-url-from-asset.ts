import { ImageAsset } from "@/schemas/asset.schema";

export function imageURLFromAsset(asset: ImageAsset) {
  if (!asset) return "";
  return URL.createObjectURL(
    new Blob([asset.data], { type: `image/${asset.type}` }),
  );
}
