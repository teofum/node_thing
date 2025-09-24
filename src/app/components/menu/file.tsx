"use client";

import { Menu, MenuItem } from "@/ui/menu-bar";
import { LuSave, LuDownload } from "react-icons/lu";
import { useMainStore } from "@/store/main.store";
import { saveJsonToFile, loadJsonFromFile } from "@/utils/json";

export function FileMenu() {
  const importProject = useMainStore((s) => s.importProject);
  const exportProject = useMainStore((s) => s.exportProject);

  return (
    <Menu label="File" value="file">
      <MenuItem
        icon={<LuSave />}
        onClick={() => saveJsonToFile(exportProject(), "project")}
      >
        Save
      </MenuItem>
      <MenuItem
        icon={<LuDownload />}
        onClick={() => loadJsonFromFile(importProject)}
      >
        Load
      </MenuItem>
    </Menu>
  );
}
