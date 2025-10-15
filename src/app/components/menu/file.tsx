"use client";

import { useState } from "react";
import { LuSave, LuDownload, LuFolderOpen, LuFileImage } from "react-icons/lu";

import { Menu, MenuItem, MenuSeparator } from "@/ui/menu-bar";
import { useUtilityStore } from "@/store/utility.store";
import { saveImageToFile } from "@/utils/image";
import { imageTypeSchema } from "@/schemas/asset.schema";
import { ExportOptions } from "./export-options";
import {
  zipExportProjectFromFile,
  zipImportProjectFromFile,
} from "@/utils/zip";

export function FileMenu() {
  const canvas = useUtilityStore((s) => s.canvas);
  const onNextRenderFinished = useUtilityStore((s) => s.onNextRenderFinished);

  const [exportOpen, setExportOpen] = useState(false);

  const exportImage = () => {
    canvas?.toBlob(async (blob) => {
      if (!blob) return;
      const data = new Uint8Array(await blob.arrayBuffer());
      const type = imageTypeSchema.parse(
        blob.type.split("/").at(-1) ?? "unknown",
      );

      saveImageToFile("export", { data, type });
    });
  };

  return (
    <>
      <Menu label="File" value="file">
        <MenuItem icon={<LuSave />} onClick={zipExportProjectFromFile}>
          Save
        </MenuItem>
        <MenuItem icon={<LuFolderOpen />} onClick={zipImportProjectFromFile}>
          Open
        </MenuItem>

        <MenuSeparator />

        <MenuItem
          icon={<LuDownload />}
          onClick={() => onNextRenderFinished(exportImage)}
        >
          Quick export as PNG
        </MenuItem>

        <MenuItem icon={<LuFileImage />} onClick={() => setExportOpen(true)}>
          Export...
        </MenuItem>
      </Menu>
      <ExportOptions open={exportOpen} onOpenChange={setExportOpen} />
    </>
  );
}
