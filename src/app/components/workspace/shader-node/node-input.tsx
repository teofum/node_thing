import { NodeProps, Position } from "@xyflow/react";
import cn from "classnames";

import { ShaderNode as ShaderNodeType, useStore } from "@/store/store";
import { NodeType } from "@/schemas/node.schema";
import { HandleWithMock } from "./mock-handle";
import { HANDLE_HEIGHT, HEADER_HEIGHT } from "./constants";

import * as Slider from "@radix-ui/react-slider";

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
          <Slider.Root
            className="relative flex h-5 w-[60px] items-center"
            min={0}
            max={1}
            step={0.01}
            defaultValue={[data.defaultValues[key] as number]}
            onValueChange={(values) =>
              updateDefaultValue(id, key, Number(values))
            }
          >
            <Slider.Track className="relative h-[3px] grow rounded-full bg-black">
              <Slider.Range className="absolute h-full rounded-full bg-white" />
            </Slider.Track>
            <Slider.Thumb
              className="block size-3 rounded-[10px] bg-white shadow-[0_0_5px] shadow-white/75 hover:bg-neutral-300 focus:shadow-[0_0_0_2px] focus:shadow-white/25 focus:outline-none"
              aria-label="Volume"
            />
          </Slider.Root>
        ) : (
          <input
            type="color"
            className="nodrag"
            defaultValue={`#${(data.defaultValues[key] as number[]).map((n) => (~~(n * 255)).toString(16).padStart(2, "0")).join("")}`}
            onChange={(ev) => {
              const color = ev.target.value;
              const r = parseInt(color.substring(1, 3), 16) / 255;
              const g = parseInt(color.substring(3, 5), 16) / 255;
              const b = parseInt(color.substring(5, 7), 16) / 255;
              updateDefaultValue(id, key, [r, g, b, 1]);
            }}
          />
        )
      ) : null}
    </div>
  );
}
