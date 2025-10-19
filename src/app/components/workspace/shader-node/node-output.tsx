import { NodeProps, Position } from "@xyflow/react";
import cn from "classnames";

import { NodeType, ShaderNode } from "@/schemas/node.schema";
import { HandleWithMock } from "./mock-handle";

type NodeOutputProps = NodeProps<ShaderNode> & {
  output: [string, NodeType["outputs"][string]];
  mock?: boolean;
};

export function NodeOutput({
  output: [key, output],
  mock = false,
}: NodeOutputProps) {
  return (
    <div className="grid grid-cols-subgrid col-span-3 h-6 items-center relative">
      <HandleWithMock
        mock={mock}
        type="source"
        position={Position.Right}
        id={key}
        className={cn("!-right-2", {
          "!bg-teal-500": output.type === "color",
          "!bg-neutral-100": output.type === "number",
        })}
      />
      <div className="text-white text-xs/4 text-end col-start-3 min-w-4">
        {output.name}
      </div>
    </div>
  );
}
