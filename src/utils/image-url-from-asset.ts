import { ImageAsset } from "@/store/asset-store";

export function imageURLFromAsset(asset: ImageAsset) {
  return `data:image/${asset.type};base64,${Buffer.from(asset.data).toString("base64")}`;
}
