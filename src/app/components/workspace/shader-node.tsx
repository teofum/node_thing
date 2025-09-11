import { Handle, NodeProps, Position } from "@xyflow/react";
import { NODE_TYPES } from "@/utils/node-type";
import { ShaderNode as ShaderNodeType, useStore } from "@/store/store";
import cn from "classnames";

const HEADER_HEIGHT = 16 + 2 * 8 + 1 + 16;

// TODO, ShaderNode por ahora solamente recibe node: Node (el de node.shema.ts)
// puede que querramos guardar el código del shader en formato string dentro del objeto data:
export function RenderShaderNode({
  data,
  selected,
  id,
}: NodeProps<ShaderNodeType>) {
  const nodeTypeInfo = NODE_TYPES[data.type];

  const updateDefaultValue = useStore((s) => s.updateNodeDefaultValue);

  // TODO acá habría que renderizar y mostrar menú para cada atributo y demás
  const outputOffset =
    Object.keys(nodeTypeInfo.inputs).length * 16 + HEADER_HEIGHT;

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
          { "bg-purple-400/15": data.type === "__output" },
        )}
      >
        {nodeTypeInfo.name}
      </div>

      <div className="p-2">
        {/* inputs */}
        {Object.entries(nodeTypeInfo.inputs).map(([key, input], i) => (
          <div key={key}>
            <Handle
              type="target"
              position={Position.Left}
              id={key}
              style={{ top: i * 16 + HEADER_HEIGHT }}
              className={cn({ "!bg-teal-500": input.type === "color" })}
            />
            <div className="text-white text-xs/4">{input.name}</div>
            {input.type === "number" ? (
              <input
                type="range"
                className="nodrag"
                min={0}
                max={1}
                step={0.01}
                onChange={(ev) =>
                  updateDefaultValue(id, key, Number(ev.target.value))
                }
              />
            ) : null}
          </div>
        ))}

        {/* outputs */}
        {Object.entries(nodeTypeInfo.outputs).map(([key, output], i) => (
          <div key={key}>
            <Handle
              type="source"
              position={Position.Right}
              id={key}
              style={{ top: i * 16 + outputOffset }}
              className={cn({ "!bg-teal-500": output.type === "color" })}
            />
            <div className="text-white text-xs/4 flex justify-end">
              {output.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
