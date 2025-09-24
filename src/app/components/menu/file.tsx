"use client";

import { Menu, MenuItem } from "@/ui/menu-bar";
import { LuSave, LuDownload } from "react-icons/lu";
import { useMainStore } from "@/store/main.store";
import { handleExport } from "@/utils/handle-export";
import { handleImport } from "@/utils/handle-import";

export function FileMenu() {
  const importProject = useMainStore((s) => s.importProject);
  const exportProject = useMainStore((s) => s.exportProject);

  return (
    <Menu label="File" value="file">
      <MenuItem
        icon={<LuSave />}
        onClick={() => handleExport(exportProject(), "project")}
      >
        Save
      </MenuItem>
      <MenuItem
        icon={<LuDownload />}
        onClick={() => handleImport(importProject)}
      >
        Load
      </MenuItem>
    </Menu>
  );
}
