import { Handle as HandleType } from "@/schemas/node.schema";
import { Handle, Position } from "@xyflow/react";
import cn from "classnames";

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
