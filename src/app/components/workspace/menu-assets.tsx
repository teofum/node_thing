import { useAssetStore } from "@/store/asset-store";
import { Button } from "@/ui/button";
import { AssetThumbnail } from "./asset-manager/thumbnail";
import { uploadImage } from "@/utils/upload-image";
import { AssetManager } from "./asset-manager";

export function MenuAssets() {
  const images = useAssetStore((s) => s.images);
  const addImage = useAssetStore((s) => s.addImage);

  const uploadImageAsset = () => uploadImage(addImage);

  const onDragStart = (event: React.DragEvent, name: string) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("type", "__input_image");
    event.dataTransfer.setData("params.image", name);
  };

  return (
    <div className="border-t border-white/15 p-2 grid grid-cols-2 gap-2 min-h-0 overflow-auto">
      {Object.entries(images).map(([key, image]) => (
        <AssetThumbnail
          key={key}
          name={key}
          asset={image}
          draggable
          onDragStart={(ev) => onDragStart(ev, key)}
        />
      ))}

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
  );
}
