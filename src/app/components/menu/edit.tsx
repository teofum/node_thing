"use client";

import { Menu, MenuItem } from "@/ui/menu-bar";
import { useProjectStore } from "@/store/project.store";
import { LuRedo2, LuUndo2 } from "react-icons/lu";

export function EditMenu() {
  const history = useProjectStore((state) => state.history);
  const done = useProjectStore((state) => state.done);
  const undo = useProjectStore((s) => s.undo);
  const redo = useProjectStore((s) => s.redo);

  return (
    <>
      <Menu label="Edit" value="edit">
        <MenuItem
          icon={<LuUndo2 />}
          onClick={undo}
          disabled={done >= history.length}
        >
          Undo
        </MenuItem>
        <MenuItem icon={<LuRedo2 />} onClick={redo} disabled={done <= 0}>
          Redo
        </MenuItem>
      </Menu>
    </>
  );
}
