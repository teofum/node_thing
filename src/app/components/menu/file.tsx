"use client";

import { Menu, MenuItem } from "@/ui/menu-bar";
import { LuSave, LuDownload } from "react-icons/lu";
import { useStore } from "@/store/store";

export function FileMenu() {
  const importProject = useStore((s) => s.importProject);
  const exportProject = useStore((s) => s.exportProject);

  const projectImport = () => {
    const json = prompt("project JSON: "); // TODO mejorar input
    if (json !== null) {
      importProject(json);
    }
  };

  const projectExport = () => {
    const json = exportProject();
    navigator.clipboard.writeText(json);
    alert("Layer copied to clipboard!"); // TODO esto tal vez cambiarlo a notifiación toast o similar
  };

  return (
    <Menu label="File" value="file">
      <MenuItem icon={<LuSave />} onClick={projectExport}>
        Save
      </MenuItem>
      <MenuItem icon={<LuDownload />} onClick={projectImport}>
        Load
      </MenuItem>
    </Menu>
  );
}
