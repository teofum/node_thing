import { create } from "zustand";

type Assets = {
  images: Record<string, Blob>;
};

type AssetActions = {
  addImage: (name: string, data: Blob) => void;
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
