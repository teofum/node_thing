import { ComponentProps, useState } from "react";

import { Button } from "@/ui/button";
import { Dialog, DialogClose } from "@/ui/dialog";
import { useUtilityStore } from "@/store/utility.store";
import { saveImageToFile } from "@/utils/image";
import { imageTypeSchema } from "@/schemas/asset.schema";
import { Select, SelectItem } from "@/ui/select";
import { Slider } from "@/ui/slider";

type ExportOptionsProps = {
  open: ComponentProps<typeof Dialog>["open"];
  onOpenChange: ComponentProps<typeof Dialog>["onOpenChange"];
};

export function ExportOptions({ open, onOpenChange }: ExportOptionsProps) {
  const canvas = useUtilityStore((s) => s.canvas);
  const onNextRenderFinished = useUtilityStore((s) => s.onNextRenderFinished);

  const [type, setType] = useState("png");
  const [quality, setQuality] = useState(75);

  const exportImage = () => {
    canvas?.toBlob(
      async (blob) => {
        if (!blob) return;
        const data = new Uint8Array(await blob.arrayBuffer());
        const type = imageTypeSchema.parse(
          blob.type.split("/").at(-1) ?? "unknown",
        );

        saveImageToFile("export", { data, type });
      },
      `image/${type}`,
      quality / 100,
    );
  };

  return (
    <Dialog
      title="Export"
      description="Save an image to your computer"
      trigger={null}
      open={open}
      onOpenChange={onOpenChange}
    >
      <div className="flex-1 grid grid-cols-[auto_12rem] border-b border-white/15 gap-3 p-3 place-content-center items-center text-right">
        <div className="text-sm/4 font-semibold">Format</div>
        <Select value={type} onValueChange={setType}>
          <SelectItem value="png">PNG</SelectItem>
          <SelectItem value="jpeg">JPEG</SelectItem>
          <SelectItem value="webp">WebP</SelectItem>
        </Select>

        {type !== "png" ? (
          <>
            <div className="text-sm/4 font-semibold">Quality</div>
            <Slider
              withInput
              className="w-full"
              value={quality}
              onChange={setQuality}
              min={0}
              max={100}
              step={1}
            />
          </>
        ) : null}
      </div>

      <div className="p-3 flex flex-row gap-2 justify-end items-end">
        <DialogClose asChild>
          <Button
            variant="outline"
            className="col-start-1 col-span-2"
            onClick={() => onNextRenderFinished(exportImage)}
          >
            Save image
          </Button>
        </DialogClose>
      </div>
    </Dialog>
  );
}
