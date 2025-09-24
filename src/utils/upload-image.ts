import { ImageAsset, imageTypeSchema } from "@/schemas/asset.schema";

export function uploadImage(
  callback: (name: string, asset: ImageAsset) => void,
) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/png, image/jpeg, image/webp";

  input.addEventListener("change", (ev) => {
    const { files } = ev.target as HTMLInputElement;
    if (!files?.length) return;

    const reader = new FileReader();
    reader.onload = () => {
      const bytes = new Uint8Array(reader.result as ArrayBuffer);
      callback(files[0].name, {
        type: imageTypeSchema.parse(
          files[0].name.split(".").at(-1) ?? "unknown",
        ),
        data: bytes,
      });
    };
    reader.readAsArrayBuffer(files[0]);
  });

  input.click();
}
