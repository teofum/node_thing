import { NodeProps, Position } from "@xyflow/react";
import cn from "classnames";

import { ShaderNode as ShaderNodeType, useNodeStore } from "@/store/node.store";
import { NodeType } from "@/schemas/node.schema";
import { HandleWithMock } from "./mock-handle";
import { HANDLE_HEIGHT, HEADER_HEIGHT } from "./constants";

import { SliderInput } from "@/ui/slider";
import { ColorInput } from "@/ui/color-picker";

type NodeInputProps = NodeProps<ShaderNodeType> & {
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
  const updateDefaultValue = useNodeStore((s) => s.updateNodeDefaultValue);
  const edges = useNodeStore((s) => s.layers[s.currentLayer].edges);

  const renderDefaultValueInput =
    !mock &&
    id !== "__output" &&
    !edges.some((edge) => edge.target === id && edge.targetHandle === key);

  return (
    <div className="flex flex-row gap-2 h-6 items-center">
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
      <div className="text-white text-xs/4">{input.name}</div>

      {renderDefaultValueInput ? (
        input.type === "number" ? (
          <SliderInput
            value={data.defaultValues[key] as number}
            onChange={(v) => updateDefaultValue(id, key, v)}
            min={input.min ?? 0}
            max={input.max ?? 1}
            step={input.step ?? 0.01}
            className="w-25"
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
