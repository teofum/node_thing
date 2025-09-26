import { ImageAsset, imageTypeSchema } from "@/schemas/asset.schema";
import { openFile } from "./file";

export async function saveImageToFile(
  suggestedName: string,
  asset: ImageAsset,
) {
  try {
    const handle = await window.showSaveFilePicker({
      suggestedName: `${suggestedName}.${asset.type}`,
      types: [
        { accept: { [`image/${asset.type}` as const]: [`.${asset.type}`] } },
      ],
    });

    const writable = await handle.createWritable();
    await writable.write(asset.data);
    await writable.close();
  } catch (e) {
    console.warn(e);
  }
}

const IMAGE_TYPE_FOR_EXTENSION: Record<string, ImageAsset["type"]> = {
  png: "png",
  jpg: "jpeg",
  jpeg: "jpeg",
  webp: "webp",
};

function getImageType(filename: string) {
  const extension = filename.split(".").at(-1) ?? "unknown";
  return Object.hasOwn(IMAGE_TYPE_FOR_EXTENSION, extension)
    ? IMAGE_TYPE_FOR_EXTENSION[extension]
    : "unknown";
}

export async function loadImageAssetFromFile(
  callback: (name: string, asset: ImageAsset) => void,
) {
  const file = await openFile(["image/png", "image/jpeg", "image/webp"]);
  if (file) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    callback(file.name, {
      type: imageTypeSchema.parse(getImageType(file.name)),
      data: bytes,
    });
  }
}
