import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  type ImageAsset,
  type AssetsState,
  assetsStateSchema,
} from "@/schemas/asset.schema";
import { opfsStorage } from "./storage/opfs-storage";

type AssetActions = {
  addImage: (name: string, data: ImageAsset) => void;
  removeImage: (name: string) => void;
};

export const useAssetStore = create<AssetsState & AssetActions>()(
  persist(
    (set) => ({
      /*
       * State
       */
      images: {},

      /*
       * Actions
       */
      addImage: (name, data) =>
        set(({ images }) => ({
          images: {
            ...images,
            [name]: data,
          },
        })),

      removeImage: (name) =>
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        set(({ images: { [name]: _, ...rest } }) => ({ images: rest })),
    }),
    {
      name: "asset-storage",
      storage: opfsStorage,
      skipHydration: true,
      onRehydrateStorage: () => (_, err) => {
        if (err) console.error(err);
      },
      merge: (persisted, current) => {
        const persistedImages = assetsStateSchema.parse(persisted).images;

        return {
          ...current,
          images: {
            ...current.images,
            ...persistedImages,
          },
        };
      },
    },
  ),
);
