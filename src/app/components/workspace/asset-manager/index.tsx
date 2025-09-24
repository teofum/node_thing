import { ComponentProps } from "react";

import { useAssetStore } from "@/store/asset.store";
import { Dialog, DialogClose } from "@/ui/dialog";
import { Button } from "@/ui/button";
import { uploadImage } from "@/utils/upload-image";
import { AssetThumbnail } from "./thumbnail";

type AssetManagerProps = {
  trigger: ComponentProps<typeof Dialog>["trigger"];
  onSelect?: (name: string) => void;
};

export function AssetManager({ trigger, onSelect }: AssetManagerProps) {
  const images = useAssetStore((s) => s.images);
  const addImage = useAssetStore((s) => s.addImage);

  const uploadImageAsset = () => uploadImage(addImage);

  return (
    <Dialog
      trigger={trigger}
      title="Asset manager"
      description="View, modify and upload assets"
    >
      <div className="flex-1 overflow-auto border-b border-white/15">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(7rem,1fr))] gap-2 p-3">
          {Object.entries(images).map(([key, image]) => (
            <AssetThumbnail key={key} name={key} asset={image}>
              <DialogClose asChild>
                <button
                  className="absolute inset-0 hover:bg-white/10 cursor-pointer"
                  onClick={() => onSelect?.(key)}
                />
              </DialogClose>
            </AssetThumbnail>
          ))}
        </div>
      </div>
      <div className="p-3 flex flex-row gap-2 justify-end items-end">
        <Button
          variant="outline"
          className="col-start-1 col-span-2"
          onClick={uploadImageAsset}
        >
          Upload image
        </Button>
      </div>
    </Dialog>
  );
}
