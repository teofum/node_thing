import { create } from "zustand";
import { combine, persist } from "zustand/middleware";

import {
  type ImageAsset,
  type AssetsState,
  assetsStateSchema,
} from "@/schemas/asset.schema";
import { opfsStorage } from "./storage/opfs-storage";

const initialState: AssetsState = { images: {} };

export const useAssetStore = create(
  persist(
    combine(initialState, (set) => ({
      addImage: async (name: string, data: ImageAsset, skipSync = false) => {
        set(({ images }) => ({
          images: {
            ...images,
            [name]: data,
          },
        }));

        if (skipSync) return;

        const { useProjectStore } = await import("./project.store");
        const { currentRoomId, collaborationEnabled, yjsDoc } =
          useProjectStore.getState();
        if (collaborationEnabled && currentRoomId && yjsDoc) {
          const { uploadAsset } = await import(
            "@/lib/collaboration/asset-sync"
          );
          await uploadAsset(currentRoomId, name, data);

          const yAssetRefs = yjsDoc.getMap("assetRefs");
          yjsDoc.transact(() => {
            yAssetRefs.set(name, true);
          }, yjsDoc);
        }
      },

      removeImage: (name: string) =>
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        set(({ images: { [name]: _, ...rest } }) => ({ images: rest })),

      clear: () => set(initialState),
    })),
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
