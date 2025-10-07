import { NodeProps, Position } from "@xyflow/react";
import cn from "classnames";

import { NodeType, ShaderNode } from "@/schemas/node.schema";
import { HANDLE_HEIGHT } from "./constants";
import { HandleWithMock } from "./mock-handle";

type NodeOutputProps = NodeProps<ShaderNode> & {
  output: [string, NodeType["outputs"][string]];
  i: number;
  offset: number;
  mock?: boolean;
};

export function NodeOutput({
  output: [key, output],
  i,
  offset,
  mock = false,
}: NodeOutputProps) {
  return (
    <div className="flex flex-row-reverse gap-2 h-6 items-center">
      <HandleWithMock
        mock={mock}
        type="source"
        position={Position.Right}
        id={key}
        style={{ top: i * HANDLE_HEIGHT + offset }}
        className={cn({
          "!bg-teal-500": output.type === "color",
          "!bg-neutral-100": output.type === "number",
        })}
      />
      <div className="text-white text-xs/4 flex justify-end">{output.name}</div>
    </div>
  );
}
