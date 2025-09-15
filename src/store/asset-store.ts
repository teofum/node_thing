import { create } from "zustand";

export type ImageAsset = {
  type: string; // TODO type this shit
  data: Uint8Array<ArrayBuffer>;
};

type Assets = {
  images: Record<string, ImageAsset>;
};

type AssetActions = {
  addImage: (name: string, data: ImageAsset) => void;
  removeImage: (name: string) => void;
};

export const useAssetStore = create<Assets & AssetActions>((set) => ({
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
    set(({ images: { [name]: _, ...rest } }) => ({ images: rest })),
}));
