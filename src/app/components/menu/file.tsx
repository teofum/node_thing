"use client";

import { Menu, MenuItem } from "@/ui/menu-bar";
import { LuSave, LuDownload } from "react-icons/lu";

export function FileMenu() {
  return (
    <Menu label="File" value="file">
      <MenuItem icon={<LuSave />}>Save</MenuItem>
      <MenuItem icon={<LuDownload />}>Load</MenuItem>
    </Menu>
  );
}
