import { Handle, NodeProps, Position } from "@xyflow/react";
import { NODE_TYPES } from "@/utils/node-type";
import { ShaderNode as ShaderNodeType } from "@/store/store";
import cn from "classnames";

// TODO, ShaderNode por ahora solamente recibe node: Node (el de node.shema.ts)
// puede que querramos guardar el código del shader en formato string dentro del objeto data:
export function RenderShaderNode({
  data,
  selected,
}: NodeProps<ShaderNodeType>) {
  const nodeTypeInfo = NODE_TYPES[data.type];

  // TODO acá habría que renderizar y mostrar menú para cada atributo y demás
  const outputOffset = Object.keys(nodeTypeInfo.inputs).length * 16 + 40;

  return (
    <div
      className={cn(
        "p-2 bg-gradient-to-b to-gray-700/20 via-gray-600/20 from-gray-500/20",
        "backdrop-blur-sm rounded-lg border",
        {
          "border-white/20": !selected,
          "border-teal-400/40 outline-teal-400/20 outline-2": selected,
        },
      )}
    >
      <div className="text-xs text-blue-50 mb-2 font-bold">
        {nodeTypeInfo.name}
      </div>

      {/* dinámicamente chequeo campos de inputs y outputs para imprimir Handles */}
      {/* inputs */}
      {Object.keys(nodeTypeInfo.inputs).map((key, i) => (
        <div key={key}>
          <Handle
            type="target"
            position={Position.Left}
            id={key}
            style={{ top: i * 16 + 40 }}
          />
          <div className="text-white text-xs"> {key}</div>
          {/* debug */}
        </div>
      ))}

      {/* outputs */}
      {Object.keys(nodeTypeInfo.outputs).map((key, i) => (
        <div key={key}>
          <Handle
            type="source"
            position={Position.Right}
            id={key}
            style={{ top: i * 16 + outputOffset }}
          />
          <div className="text-white text-xs flex justify-end"> {key}</div>
          {/* debug */}
        </div>
      ))}
    </div>
  );
}
