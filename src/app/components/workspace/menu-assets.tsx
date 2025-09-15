import { useAssetStore } from "@/store/image-store";

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

  const onDragStart = (event: React.DragEvent) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("type", "__input");
  };

  return (
    <div className="border-t border-white/15 p-2 grid grid-cols-2 gap-2 min-h-0 overflow-auto">
      {Object.entries(images).map(([key, image]) => (
        <div
          key={key}
          className="relative flex flex-col rounded-lg border border-white/15 overflow-hidden group/asset cursor-grab"
          draggable
          onDragStart={onDragStart}
        >
          <div className="absolute bottom-0 left-0 right-0 p-1 text-xs/3 bg-black/40 opacity-0 group-hover/asset:opacity-100 transition-opacity duration-150">
            {key}
          </div>
          <img
            alt=""
            className="aspect-square object-cover"
            src={`data:image/${image.type};base64,${Buffer.from(image.data).toString("base64")}`}
          />
        </div>
      ))}

      <input
        className="bg-teal-50 rounded-lg text-black p-2 mt-4 w-40 text-xs"
        type="file"
        accept="image/png, image/jpeg, image/webp"
        onChange={uploadImage}
      />
    </div>
  );
}
