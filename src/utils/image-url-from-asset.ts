import { ImageAsset } from "@/schemas/asset.schema";

export function imageURLFromAsset(asset: ImageAsset) {
  if (!asset) return "";
  return `data:image/${asset.type};base64,${Buffer.from(asset.data).toString("base64")}`;
}
