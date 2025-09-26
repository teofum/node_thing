import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  type ImageAsset,
  type AssetsState,
  serializedAssetsStateSchema,
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
      storage: createJSONStorage(() => opfsStorage),
      skipHydration: true,
      merge: (persisted, current) => {
        const parsed = serializedAssetsStateSchema.parse(persisted);

        const persistedImages: AssetsState["images"] = {};
        for (const [key, serializedAsset] of Object.entries(parsed.images)) {
          const data = Uint8Array.from(Object.values(serializedAsset.data));
          const type = serializedAsset.type;

          persistedImages[key] = { type, data };
        }

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
