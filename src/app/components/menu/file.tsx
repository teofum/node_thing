"use client";

import { useState } from "react";
import {
  LuSave,
  LuDownload,
  LuFolderOpen,
  LuFileImage,
  LuFile,
} from "react-icons/lu";

import { Menu, MenuItem, MenuSeparator } from "@/ui/menu-bar";
import { useUtilityStore } from "@/store/utility.store";
import { saveImageToFile } from "@/utils/image";
import { imageTypeSchema } from "@/schemas/asset.schema";
import { ExportOptions } from "./export-options";
import {
  exportProjectFromFile,
  importProjectFromFile,
  ImportResult,
} from "@/utils/project";
import { ConfirmImport } from "./confirm-import";
import { PromptDialog } from "@/ui/prompt-dialog";
import { useProjectStore } from "@/store/project.store";
import { useAssetStore } from "@/store/asset.store";

export function FileMenu() {
  const canvas = useUtilityStore((s) => s.canvas);
  const onNextRenderFinished = useUtilityStore((s) => s.onNextRenderFinished);

  const resetProject = useProjectStore((s) => s.reset);
  const clearAssets = useAssetStore((s) => s.clear);

  const [newOpen, setNewOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult>(undefined);

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

  const handleOpen = async () => {
    setImportResult(await importProjectFromFile());
  };

  const handleNew = () => {
    resetProject();
    clearAssets();
  };

  return (
    <>
      <Menu label="File" value="file">
        <MenuItem icon={<LuFile />} onClick={() => setNewOpen(true)}>
          New
        </MenuItem>
        <MenuItem icon={<LuSave />} onClick={exportProjectFromFile}>
          Save
        </MenuItem>
        <MenuItem icon={<LuFolderOpen />} onClick={handleOpen}>
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
      <ConfirmImport
        importResult={importResult}
        setImportResult={setImportResult}
      />
      <PromptDialog
        title="New file"
        trigger={null}
        description="Create a new project"
        open={newOpen}
        onOpenChange={setNewOpen}
        onConfirm={handleNew}
      >
        <div>Create a new project?</div>
        <strong className="text-sm/4 font-semibold text-red-400">
          All unsaved work will be lost. This action cannot be undone!
        </strong>
      </PromptDialog>
    </>
  );
}
