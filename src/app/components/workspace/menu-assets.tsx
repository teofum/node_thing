import { useAssetStore } from "@/store/asset-store";
import { imageURLFromAsset } from "@/utils/image-url-from-asset";

export function MenuAssets() {
  const images = useAssetStore((s) => s.images);
  const addImage = useAssetStore((s) => s.addImage);

  const uploadImage = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = ev.target;
    if (!files?.length) return;

    const reader = new FileReader();
    reader.onload = () => {
      const bytes = new Uint8Array(reader.result as ArrayBuffer);
      addImage(files[0].name, {
        type: files[0].name.split(".").at(-1) ?? "unknown",
        data: bytes,
      });
    };
    reader.readAsArrayBuffer(files[0]);
  };

  const onDragStart = (event: React.DragEvent, name: string) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("type", "__input");
    event.dataTransfer.setData("params.image", name);
  };

  return (
    <div className="border-t border-white/15 p-2 grid grid-cols-2 gap-2 min-h-0 overflow-auto">
      {Object.entries(images).map(([key, image]) => (
        <div
          key={key}
          className="relative flex flex-col rounded-lg border border-white/15 overflow-hidden group/asset cursor-grab"
          draggable
          onDragStart={(ev) => onDragStart(ev, key)}
        >
          <div className="absolute bottom-0 left-0 right-0 p-1 text-xs/3 bg-black/40 opacity-0 group-hover/asset:opacity-100 transition-opacity duration-150">
            {key}
          </div>
          {/* We don't care about nextjs image optimization here, it's a local data url */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt=""
            className="aspect-square object-cover"
            src={imageURLFromAsset(image)}
          />
        </div>
      ))}

      <input
        className="bg-teal-50 rounded-lg text-black p-2 mt-4 w-40 text-xs col-start-1 col-span-2"
        type="file"
        accept="image/png, image/jpeg, image/webp"
        onChange={uploadImage}
      />
    </div>
  );
}
