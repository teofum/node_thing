"use client";

import { Menu, MenuItem } from "@/ui/menu-bar";
import { LuSave } from "react-icons/lu";

export function FileMenu() {
  return (
    <Menu label="File" value="file">
      <MenuItem icon={<LuSave />}>Save</MenuItem>
    </Menu>
  );
}
