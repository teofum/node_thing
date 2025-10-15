import { NodeProps, Position } from "@xyflow/react";
import cn from "classnames";

import { NodeType, ShaderNode } from "@/schemas/node.schema";
import { useProjectStore } from "@/store/project.store";
import { HandleWithMock } from "./mock-handle";

import { ColorInput } from "@/ui/color-picker";
import { NumberDrag } from "@/ui/number-drag";

type NodeInputProps = NodeProps<ShaderNode> & {
  input: [string, NodeType["inputs"][string]];
  mock?: boolean;
};

export function NodeInput({
  data,
  id,
  input: [key, input],
  mock = false,
}: NodeInputProps) {
  const updateDefaultValue = useProjectStore((s) => s.updateNodeDefaultValue);
  const edges = useProjectStore((s) => s.layers[s.currentLayer].edges);

  const renderDefaultValueInput =
    !mock &&
    id !== "__output" &&
    !edges.some((edge) => edge.target === id && edge.targetHandle === key);

  return (
    <div className="grid grid-cols-subgrid col-span-3 h-6 items-center relative">
      <HandleWithMock
        mock={mock}
        type="target"
        position={Position.Left}
        id={key}
        className={cn("!-left-2", {
          "!bg-teal-500": input.type === "color",
          "!bg-neutral-100": input.type === "number",
        })}
      />
      <div className="text-xs/4 min-w-4">{input.name}</div>

      {renderDefaultValueInput ? (
        input.type === "number" ? (
          <NumberDrag
            value={data.defaultValues[key] as number}
            onChange={(v) => updateDefaultValue(id, key, v)}
            min={input.min}
            max={input.max}
            step={input.step ?? 0.01}
            size="sm"
            className="w-20 nodrag"
            progress
          />
        ) : (
          <ColorInput
            defaultColor={data.defaultValues[key] as number[]}
            onChange={(c) => {
              updateDefaultValue(id, key, c);
            }}
          />
        )
      ) : null}
    </div>
  );
}
