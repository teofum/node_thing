import * as z from "zod/v4";

export const imageTypeSchema = z.enum(["png", "jpeg", "webp"]);

export const imageAssetSchema = z.object({
  type: imageTypeSchema,
  data: z.instanceof(Uint8Array<ArrayBuffer>),
});

export type ImageAsset = z.infer<typeof imageAssetSchema>;

export const assetsStateSchema = z.object({
  images: z.record(z.string(), imageAssetSchema),
});

export type AssetsState = z.infer<typeof assetsStateSchema>;

export const serializedImageAssetSchema = z.object({
  type: imageTypeSchema,
  data: z.record(z.string(), z.number()),
});

export const serializedAssetsStateSchema = z.object({
  images: z.record(z.string(), serializedImageAssetSchema),
});

export const serializedAssetsStorageSchema = z.object({
  state: serializedAssetsStateSchema,
  version: z.number(),
});

export const assetInfoStorageSchema = z.object({
  images: z.tuple([z.string(), imageTypeSchema]).array(),
});
