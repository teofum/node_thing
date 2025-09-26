import { useAssetStore } from "@/store/asset.store";
import { Button } from "@/ui/button";
import { AssetThumbnail } from "./asset-manager/thumbnail";
import { loadImageAssetFromFile } from "@/utils/image";
import { AssetManager } from "./asset-manager";

export function MenuAssets() {
  const images = useAssetStore((s) => s.images);
  const addImage = useAssetStore((s) => s.addImage);

  const uploadImageAsset = () => loadImageAssetFromFile(addImage);

  const onDragStart = (event: React.DragEvent, name: string) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("type", "__input_image");
    event.dataTransfer.setData("params.image", name);
  };

  return (
    <div className="flex flex-col h-full border-t border-white/15">
      <div className="grow overflow-auto min-h-0 border-b border-white/15">
        <div className="grid grid-cols-2 gap-2 p-2">
          {Object.entries(images).map(([key, image]) => (
            <AssetThumbnail
              key={key}
              name={key}
              asset={image}
              draggable
              onDragStart={(ev) => onDragStart(ev, key)}
            />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2 p-2">
        <Button
          variant="outline"
          className="col-start-1 col-span-2"
          onClick={uploadImageAsset}
        >
          Upload image
        </Button>

        <AssetManager
          trigger={
            <Button variant="outline" className="col-start-1 col-span-2">
              Asset manager
            </Button>
          }
        />
      </div>
    </div>
  );
}
