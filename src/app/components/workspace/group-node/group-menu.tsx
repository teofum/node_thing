import { NodeProps } from "@xyflow/react";
import {
  LuEllipsisVertical,
  LuExpand,
  LuPencilLine,
  LuTrash2,
} from "react-icons/lu";

import { useProjectStore } from "@/store/project.store";
import { GroupNode } from "@/store/project.types";
import { Button } from "@/ui/button";
import { DropdownMenu, DropdownMenuItem } from "@/ui/dropdown-menu";

export function GroupMenu({
  id,
  rename,
}: NodeProps<GroupNode> & { rename: () => void }) {
  const remove = useProjectStore((state) => state.removeNode);
  const openGroup = useProjectStore((s) => s.openGroup);

  return (
    <DropdownMenu
      trigger={
        <Button icon variant="ghost" size="sm" className="ml-auto -mr-2">
          <LuEllipsisVertical />
        </Button>
      }
    >
      <DropdownMenuItem icon={<LuExpand />} onClick={() => openGroup(id)}>
        Open
      </DropdownMenuItem>
      <DropdownMenuItem icon={<LuPencilLine />} onClick={rename}>
        Rename
      </DropdownMenuItem>
      <DropdownMenuItem
        className="text-red-400"
        icon={<LuTrash2 />}
        onClick={() => remove(id)}
      >
        Remove
      </DropdownMenuItem>
    </DropdownMenu>
  );
}
