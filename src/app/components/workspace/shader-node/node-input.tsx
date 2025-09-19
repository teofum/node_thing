import { NodeProps, Position } from "@xyflow/react";
import cn from "classnames";

import { ShaderNode as ShaderNodeType, useStore } from "@/store/store";
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
  const updateDefaultValue = useStore((s) => s.updateNodeDefaultValue);
  const edges = useStore((s) => s.layers[s.currentLayer].edges);

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
            min={0}
            max={1}
            step={0.01}
            className="w-[100px]"
          />
        ) : (
          <ColorInput
            defaultColor={`#${(data.defaultValues[key] as number[]).map((n) => (~~(n * 255)).toString(16).padStart(2, "0")).join("")}`}
            onChange={(c) => {
              const r = parseInt(c.substring(1, 3), 16) / 255;
              const g = parseInt(c.substring(3, 5), 16) / 255;
              const b = parseInt(c.substring(5, 7), 16) / 255;
              updateDefaultValue(id, key, [r, g, b, 1]);
            }}
          />
        )
      ) : null}
    </div>
  );
}
