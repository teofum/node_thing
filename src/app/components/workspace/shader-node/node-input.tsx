import { NodeProps, Position } from "@xyflow/react";
import cn from "classnames";

import { NodeType, ShaderNode } from "@/schemas/node.schema";
import { useProjectStore } from "@/store/project.store";
import { HANDLE_HEIGHT, HEADER_HEIGHT } from "./constants";
import { HandleWithMock } from "./mock-handle";

import { ColorInput } from "@/ui/color-picker";
import { NumberDrag } from "@/ui/number-drag";

type NodeInputProps = NodeProps<ShaderNode> & {
  input: [string, NodeType["inputs"][string]];
  i: number;
  mock?: boolean;
};

export function NodeInput({
  data,
  id,
  input: [key, input],
  i,
  mock = false,
}: NodeInputProps) {
  const updateDefaultValue = useProjectStore((s) => s.updateNodeDefaultValue);
  const edges = useProjectStore((s) => s.layers[s.currentLayer].edges);

  const renderDefaultValueInput =
    !mock &&
    id !== "__output" &&
    !edges.some((edge) => edge.target === id && edge.targetHandle === key);

  return (
    <div className="grid grid-cols-subgrid col-span-3 h-6 items-center">
      <HandleWithMock
        mock={mock}
        type="target"
        position={Position.Left}
        id={key}
        style={{ top: i * HANDLE_HEIGHT + HEADER_HEIGHT }}
        className={cn({
          "!bg-teal-500": input.type === "color",
          "!bg-neutral-100": input.type === "number",
        })}
      />
      <div className="text-white text-xs/4 min-w-4">{input.name}</div>

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
