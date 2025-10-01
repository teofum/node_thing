import { useState } from "react";
import { NodeProps } from "@xyflow/react";
import {
  LuEllipsisVertical,
  LuPencilLine,
  LuStar,
  LuTrash2,
} from "react-icons/lu";
import cn from "classnames";

import { ShaderNode as ShaderNodeType, useMainStore } from "@/store/main.store";
import { DropdownMenu, DropdownMenuItem } from "@/ui/dropdown-menu";
import { Button } from "@/ui/button";
import { PromptDialog } from "@/ui/prompt-dialog";
import { HANDLE_HEIGHT, HEADER_HEIGHT } from "./constants";
import { NodeInput } from "./node-input";
import { NodeOutput } from "./node-output";
import { NodeParameter } from "./node-parameter";
import { ShaderEditor } from "../shader-editor";

export function RenderShaderNode(
  props: NodeProps<ShaderNodeType> & { mock?: boolean },
) {
  const { data, selected } = props;
  const nodeTypes = useMainStore((state) => state.nodeTypes);
  const remove = useMainStore((state) => state.removeNode);
  const deleteNodeType = useMainStore((state) => state.deleteNodeType);

  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);

  const nodeTypeInfo = nodeTypes[data.type];
  if (!nodeTypeInfo) return null;

  const outputOffset =
    Object.keys(nodeTypeInfo.inputs).length * HANDLE_HEIGHT + HEADER_HEIGHT;

  const removeNode = () => {
    remove(props.id);
  };

  return (
    <div
      className={cn("glass rounded-lg border min-w-32", {
        "border-white/20": !selected,
        "border-teal-400/40 outline-teal-400/20 outline-2": selected,
      })}
    >
      <div
        className={cn(
          "text-xs/4 px-3 py-2 font-bold border-b border-white/15 bg-clip-padding rounded-t-[7px]",
          {
            "bg-purple-400/15": data.type === "__output",
            "bg-orange-400/15": nodeTypeInfo.category === "Input",
            "bg-blue-400/15": nodeTypeInfo.category === "Math",
          },
        )}
      >
        <div className="flex items-center gap-1">
          {nodeTypeInfo.name}
          {/* star to recognize purchased shaders */}
          {nodeTypeInfo.isPurchased ? (
            <LuStar className="w-3 h-3 opacity-70" />
          ) : null}
          {!props.mock && data.type !== "__output" ? (
            <DropdownMenu
              trigger={
                <Button
                  icon
                  variant="ghost"
                  size="sm"
                  className="ml-auto -mr-2"
                >
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
          ) : null}
          {props.mock && data.type.startsWith("custom") ? (
            <>
              <DropdownMenu
                trigger={
                  <Button
                    icon
                    variant="ghost"
                    size="sm"
                    className="ml-auto -mr-2"
                  >
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
          ) : null}
        </div>
      </div>

      <div className="p-2">
        {/* inputs */}
        {Object.entries(nodeTypeInfo.inputs).map(([key, input], i) => (
          <NodeInput key={key} input={[key, input]} i={i} {...props} />
        ))}

        {/* outputs */}
        {Object.entries(nodeTypeInfo.outputs).map(([key, output], i) => (
          <NodeOutput
            key={key}
            output={[key, output]}
            i={i}
            offset={outputOffset}
            {...props}
          />
        ))}

        {/* parameters */}
        {!props.mock
          ? Object.entries(nodeTypeInfo.parameters).map(([key, param]) => (
              <NodeParameter key={key} name={key} param={param} {...props} />
            ))
          : null}
      </div>
    </div>
  );
}
