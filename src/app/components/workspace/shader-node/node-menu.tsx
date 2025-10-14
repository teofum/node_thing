import { NodeProps } from "@xyflow/react";
import { LuEllipsisVertical, LuTrash2 } from "react-icons/lu";

import { ShaderNode } from "@/schemas/node.schema";
import { useProjectStore } from "@/store/project.store";
import { Button } from "@/ui/button";
import { DropdownMenu, DropdownMenuItem } from "@/ui/dropdown-menu";

export function NodeMenu({
  id,
  data,
  mock,
}: NodeProps<ShaderNode> & { mock?: boolean }) {
  const remove = useProjectStore((state) => state.removeNode);

  if (mock || data.type === "__output") return null;

  const removeNode = () => {
    remove(id);
  };

  return (
    <DropdownMenu
      trigger={
        <Button icon variant="ghost" size="sm" className="ml-auto -mr-2">
          <LuEllipsisVertical />
        </Button>
      }
    >
      <DropdownMenuItem
        className="text-red-400"
        icon={<LuTrash2 />}
        onClick={removeNode}
      >
        Remove
      </DropdownMenuItem>
    </DropdownMenu>
  );
}
