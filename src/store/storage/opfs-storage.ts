import { type StateStorage } from "zustand/middleware";

import {
  assetInfoStorageSchema,
  serializedAssetsStorageSchema,
  type AssetsState,
} from "@/schemas/asset.schema";

export const opfsStorage = {
  getItem: async (name) => {
    const storedImages = window.localStorage.getItem(name);
    if (!storedImages) {
      console.log("no data");
      return JSON.stringify({ state: { images: {} }, version: 0 });
    }

    const { images } = assetInfoStorageSchema.parse(JSON.parse(storedImages));
    console.log("loading images", images);

    const opfsRoot = await navigator.storage.getDirectory();
    const imageData = await Promise.all(
      images.map(async ([name, type]) => {
        console.log("loading image", name);

        try {
          const fileHandle = await opfsRoot.getFileHandle(name);
          const file = await fileHandle.getFile();
          console.log("image file", file);
          const data = new Uint8Array(await file.arrayBuffer());

          console.log("loaded image", name, type, data);
          return { name, type, data };
        } catch (e) {
          console.log(`Failed to load ${name}: ${e}`);
          throw new Error(`Failed to load ${name}: ${e}`);
        }
      }),
    );

    const state: AssetsState = { images: {} };
    for (const { name, type, data } of imageData) {
      state.images[name] = { type, data };
    }

    console.log("loaded images", state);
    return JSON.stringify({ state, version: 0 });
  },
  setItem: async (name, value) => {
    const { state } = serializedAssetsStorageSchema.parse(JSON.parse(value));

    const opfsRoot = await navigator.storage.getDirectory();
    const images = await Promise.all(
      Object.entries(state.images).map(async ([name, serializedAsset]) => {
        const data = Uint8Array.from(Object.values(serializedAsset.data));
        const type = serializedAsset.type;

        console.log("saving image", name, type, data);

        try {
          const file = await opfsRoot.getFileHandle(name, { create: true });
          const writer = await file.createWritable();

          console.log("saving image", name, type, data.byteLength);
          writer.truncate(data.byteLength);
          writer.write({ type: "write", data, position: 0 });
          writer.close();
        } catch (e) {
          console.warn(`Failed to save ${name}: ${e}`);
        }

        return [name, type] as const;
      }),
    );

    console.log("saved images", images);
    window.localStorage.setItem(name, JSON.stringify({ images }));
  },
  removeItem: async (name) => {
    const storedImages = window.localStorage.getItem(name);
    if (!storedImages) return;

    const { images } = assetInfoStorageSchema.parse(JSON.parse(storedImages));
    console.log("deleting images", images);

    const opfsRoot = await navigator.storage.getDirectory();
    await Promise.all(
      images.map(async ([name]) => {
        try {
          opfsRoot.removeEntry(name);
        } catch (e) {
          console.warn(`Failed to delete ${name}: ${e}`);
        }
      }),
    );

    window.localStorage.removeItem(name);
  },
} satisfies StateStorage;
