import { Handle, NodeProps, Position } from "@xyflow/react";
import cn from "classnames";

import { GroupNode, isShader } from "@/store/project.types";
import { Button } from "@/ui/button";
import { useProjectStore } from "@/store/project.store";

import { ShaderNodeContainer } from "../shader-node";
import { Handle as HandleType } from "@/schemas/node.schema";

type GroupHandleProps = {
  id: string;
  input: HandleType;
  type: "target" | "source";
};

export function GroupHandle({ id, input, type }: GroupHandleProps) {
  return (
    <div className="grid grid-cols-subgrid col-span-3 h-6 items-center relative">
      <Handle
        type={type}
        position={type === "target" ? Position.Left : Position.Right}
        id={id}
        className={cn({
          "!bg-teal-500": input.type === "color",
          "!bg-neutral-100": input.type === "number",
          "!-left-2": type === "target",
          "!-right-2": type === "source",
        })}
      />
      <div
        className={cn("text-xs/4 min-w-4", {
          "text-end col-start-3": type === "source",
        })}
      >
        {input.name}
      </div>
    </div>
  );
}

export function RenderGroupNode(props: NodeProps<GroupNode>) {
  const openGroup = useProjectStore((s) => s.openGroup);

  const nodes = props.data.nodes;
  const inputs = nodes
    .filter(isShader)
    .filter((n) => n.data.type.startsWith("__group_input"));
  const outputs = nodes
    .filter(isShader)
    .filter((n) => n.data.type.startsWith("__group_output"));

  return (
    <ShaderNodeContainer {...props}>
      <div className="text-xs/5 px-3 py-1.5 font-bold border-b border-white/15 bg-clip-padding rounded-t-[11px] bg-amber-400/15">
        <div className="flex items-center gap-1">
          Group
          {/*<NodeMenu {...props} />*/}
        </div>
      </div>

      <div className="p-2 grid grid-cols-[auto_auto_auto] gap-x-2">
        {inputs.map(({ id, data }) => (
          <GroupHandle
            key={id}
            id={id}
            type="target"
            input={{
              name: data.parameters.name.value ?? "Input",
              type: id.endsWith("color") ? "color" : "number",
            }}
          />
        ))}

        {outputs.map(({ id, data }) => (
          <GroupHandle
            key={id}
            id={id}
            type="source"
            input={{
              name: data.parameters.name.value ?? "Output",
              type: id.endsWith("color") ? "color" : "number",
            }}
          />
        ))}

        <Button
          variant="outline"
          className="col-span-3 mt-2"
          onClick={() => openGroup(props.id)}
        >
          Edit
        </Button>
      </div>
    </ShaderNodeContainer>
  );
}
