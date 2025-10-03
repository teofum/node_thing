import { useState } from "react";
import { NodeProps } from "@xyflow/react";
import { LuEllipsisVertical, LuPencilLine, LuTrash2 } from "react-icons/lu";

import { ShaderNode as ShaderNodeType, useMainStore } from "@/store/main.store";
import { DropdownMenu, DropdownMenuItem } from "@/ui/dropdown-menu";
import { Button } from "@/ui/button";
import { PromptDialog } from "@/ui/prompt-dialog";
import { ShaderEditor } from "../shader-editor";

export function CustomShaderMenu({
  data,
  mock,
}: NodeProps<ShaderNodeType> & { mock?: boolean }) {
  const nodeTypes = useMainStore((state) => state.nodeTypes);
  const deleteNodeType = useMainStore((state) => state.deleteNodeType);

  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);

  const nodeTypeInfo = nodeTypes[data.type];

  if (!mock || !data.type.startsWith("custom")) return null;

  return (
    <>
      <DropdownMenu
        trigger={
          <Button icon variant="ghost" size="sm" className="ml-auto -mr-2">
            <LuEllipsisVertical />
          </Button>
        }
      >
        <DropdownMenuItem
          icon={<LuPencilLine />}
          onClick={() => setEditorOpen(true)}
        >
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-red-400"
          icon={<LuTrash2 />}
          onClick={() => setDeleteConfirmationOpen(true)}
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenu>

      <PromptDialog
        title={"Delete shader"}
        description=""
        trigger={null}
        open={deleteConfirmationOpen}
        onOpenChange={setDeleteConfirmationOpen}
        danger
        confirmText="Delete"
        onConfirm={() => deleteNodeType(data.type)}
      >
        <div>Delete custom shader &quot;{nodeTypeInfo.name}&quot;?</div>
        <strong className="text-sm/4 font-semibold text-red-400">
          This action cannot be undone!
        </strong>
      </PromptDialog>
      <ShaderEditor
        editNode={data.type}
        trigger={null}
        open={editorOpen}
        onOpenChange={setEditorOpen}
      />
    </>
  );
}
