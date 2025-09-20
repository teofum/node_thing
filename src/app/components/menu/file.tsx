"use client";

import { Menu, MenuItem } from "@/ui/menu-bar";
import { LuSave, LuDownload } from "react-icons/lu";
import { useStore } from "@/store/store";

export function FileMenu() {
  const importProject = useStore((s) => s.importProject);
  const exportProject = useStore((s) => s.exportProject);

  const projectImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file === undefined) {
        return;
      }

      const json = await file.text();
      importProject(json); // TODO manejo de errores
    };

    input.click();
  };

  const projectExport = async () => {
    const json = exportProject();

    const handle = await window.showSaveFilePicker({
      suggestedName: "project.json",
      types: [{ accept: { "application/json": [".json"] } }],
    });

    const writable = await handle.createWritable();
    await writable.write(json);
    await writable.close();
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
