"use client";

import { Menu, MenuItem } from "@/ui/menu-bar";

export function FileMenu() {
  return (
    <Menu label="File" value="file">
      <MenuItem>todo</MenuItem>
    </Menu>
  );
}
