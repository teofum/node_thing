import { NodeProps } from "@xyflow/react";
import { LuCopy, LuEllipsisVertical, LuTrash2 } from "react-icons/lu";

import { ShaderNode } from "@/schemas/node.schema";
import { useProjectStore } from "@/store/project.store";
import { Button } from "@/ui/button";
import { DropdownMenu, DropdownMenuItem } from "@/ui/dropdown-menu";

const OFFSET = 20;
function getOffsetPosition(x: number, y: number) {
  return { x: x + OFFSET, y: y + OFFSET };
}

export function NodeMenu({
  id,
  positionAbsoluteX: x,
  positionAbsoluteY: y,
  data,
  mock,
}: NodeProps<ShaderNode> & { mock?: boolean }) {
  const remove = useProjectStore((state) => state.removeNode);
  const addNode = useProjectStore((state) => state.addNode);

  if (mock || data.type === "__output") return null;

  const removeNode = () => {
    remove(id);
  };

  const duplicate = () => {
    // setTimeout makes the add run after the click handler, so the existing
    // node doesn't get immediately re selected and goes on top of the new one
    setTimeout(
      () => addNode(data.type, getOffsetPosition(x, y), data.parameters),
      1,
    );
  };

  return (
    <DropdownMenu
      trigger={
        <Button icon variant="ghost" size="sm" className="ml-auto -mr-2">
          <LuEllipsisVertical />
        </Button>
      }
    >
      <DropdownMenuItem icon={<LuCopy />} onClick={duplicate}>
        Duplicate
      </DropdownMenuItem>
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
