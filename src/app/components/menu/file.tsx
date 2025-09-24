"use client";

import { Menu, MenuItem, MenuSeparator } from "@/ui/menu-bar";
import { LuSave, LuDownload, LuFolderOpen } from "react-icons/lu";
import { useMainStore } from "@/store/main.store";
import { saveJsonToFile, loadJsonFromFile } from "@/utils/json";
import { useUtilityStore } from "@/store/utility.store";
import { saveImageToFile } from "@/utils/image";
import { imageTypeSchema } from "@/schemas/asset.schema";

export function FileMenu() {
  const importProject = useMainStore((s) => s.importProject);
  const exportProject = useMainStore((s) => s.exportProject);
  const canvas = useUtilityStore((s) => s.canvas);
  const onNextRenderFinished = useUtilityStore((s) => s.onNextRenderFinished);

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
    <Menu label="File" value="file">
      <MenuItem
        icon={<LuSave />}
        onClick={() => saveJsonToFile(exportProject(), "project")}
      >
        Save
      </MenuItem>
      <MenuItem
        icon={<LuFolderOpen />}
        onClick={() => loadJsonFromFile(importProject)}
      >
        Load
      </MenuItem>

      <MenuSeparator />

      <MenuItem
        icon={<LuDownload />}
        onClick={() => onNextRenderFinished(exportImage)}
      >
        Export image
      </MenuItem>
    </Menu>
  );
}
