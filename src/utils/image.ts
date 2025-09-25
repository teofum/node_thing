import { ImageAsset, imageTypeSchema } from "@/schemas/asset.schema";

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

export function loadImageAssetFromFile(
  callback: (name: string, asset: ImageAsset) => void,
) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/png, image/jpeg, image/webp";

  input.addEventListener("change", (ev) => {
    const { files } = ev.target as HTMLInputElement;
    if (!files?.length) return;

    files[0].arrayBuffer().then((ab) => {
      const bytes = new Uint8Array(ab);
      callback(files[0].name, {
        type: imageTypeSchema.parse(
          files[0].name.split(".").at(-1) ?? "unknown",
        ),
        data: bytes,
      });
    });
  });

  input.click();
}
