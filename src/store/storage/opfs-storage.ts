import { PersistStorage } from "zustand/middleware";

import {
  assetInfoStorageSchema,
  type AssetsState,
} from "@/schemas/asset.schema";

export const opfsStorage = {
  getItem: async (name) => {
    const storedImages = window.localStorage.getItem(name);
    if (!storedImages) {
      return { state: { images: {} }, version: 0 };
    }

    const { images } = assetInfoStorageSchema.parse(JSON.parse(storedImages));

    const opfsRoot = await navigator.storage.getDirectory();
    const imageData = await Promise.all(
      images.map(async ([name, type]) => {
        try {
          const fileHandle = await opfsRoot.getFileHandle(name);
          const file = await fileHandle.getFile();
          const data = new Uint8Array(await file.arrayBuffer());

          return { name, type, data };
        } catch (e) {
          console.error(`Failed to load ${name}: ${e}`);
          throw new Error(`Failed to load ${name}: ${e}`);
        }
      }),
    );

    const state: AssetsState = { images: {} };
    for (const { name, type, data } of imageData) {
      state.images[name] = { type, data };
    }

    return { state, version: 0 };
  },
  setItem: async (name, value) => {
    const { state } = value;

    const opfsRoot = await navigator.storage.getDirectory();
    const images = await Promise.all(
      Object.entries(state.images).map(async ([name, { type, data }]) => {
        try {
          const file = await opfsRoot.getFileHandle(name, { create: true });
          const writer = await file.createWritable();

          writer.truncate(data.byteLength);
          writer.write({ type: "write", data, position: 0 });
          writer.close();
        } catch (e) {
          console.warn(`Failed to save ${name}: ${e}`);
        }

        return [name, type] as const;
      }),
    );

    window.localStorage.setItem(name, JSON.stringify({ images }));
  },
  removeItem: async (name) => {
    const storedImages = window.localStorage.getItem(name);
    if (!storedImages) return;

    const { images } = assetInfoStorageSchema.parse(JSON.parse(storedImages));

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
} satisfies PersistStorage<AssetsState, void>;
