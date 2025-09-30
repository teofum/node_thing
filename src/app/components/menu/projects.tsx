"use client";

import { Menu, MenuItem, MenuSeparator } from "@/ui/menu-bar";
import { LuCloudDownload, LuCloudUpload, LuMedal } from "react-icons/lu";

export function ProjectsMenu() {
  return (
    <>
      {/* TODO agregar concional acá */}
      <Menu label="Projects" value="file">
        <MenuItem
          icon={<LuMedal />}
          //onClick={}
        >
          Premium
        </MenuItem>

        <MenuItem
          icon={<LuCloudUpload />}
          //onClick={}
        >
          (Save Online)
        </MenuItem>

        <MenuSeparator />

        <MenuItem
          icon={<LuCloudDownload />}
          //onClick={}
        >
          (for each Project)
        </MenuItem>
      </Menu>
    </>
  );
}
