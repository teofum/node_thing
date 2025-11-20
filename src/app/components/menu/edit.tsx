"use client";

import { Menu, MenuItem, MenuSeparator } from "@/ui/menu-bar";
import { useProjectStore } from "@/store/project.store";
import { LuRedo2, LuUndo2 } from "react-icons/lu";

export function EditMenu() {
  const undo = useProjectStore((s) => s.undo);
  const redo = useProjectStore((s) => s.redo);

  return (
    <>
      <Menu label="Edit" value="edit">
        <MenuItem icon={<LuUndo2 />} onClick={undo}>
          Undo
        </MenuItem>
        <MenuItem icon={<LuRedo2 />} onClick={redo}>
          Redo
        </MenuItem>
      </Menu>
    </>
  );
}
