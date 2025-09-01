// nodo elemental para cada shader del proyecto

// nota: no usar los hooks de React Flow, usar directamente nuestro store del zustand en store.ts

import { Handle, Position } from "@xyflow/react";
import { NodeData } from "@/schemas/node.schema";
import { NODE_TYPES } from "@/utils/node-type";

// TODO, ShaderNode por ahora solamente recibe node: Node (el de node.shema.ts)
// puede que querramos guardar el código del shader en formato string dentro del objeto data:
export type RenderShaderNodeProps = {
  data: NodeData;
};

export function RenderShaderNode({ data }: RenderShaderNodeProps) {
  const nodeTypeInfo = NODE_TYPES[data.type];

  // TODO acá habría que renderizar y mostrar menú para cada atributo y demás

  return (
    <div className="p-2 bg-amber-500">
      <div className=" text-blue-400"></div> {/* debug */}
      <div className="text-xs text-gray-400 mb-2">{nodeTypeInfo.name}</div>{" "}
      {/* debug */}
      {/*
       * NOTA: React Flow usa internamente Handle id y Edge sourceHandle/targetHandle para identificar handles
       * sería luego conectarlo con nuestro Edge del schema
       */}
      {/* dinámicamente chequeo campos de inputs y outputs para imprimir Handles */}
      {/* inputs */}
      {Object.keys(nodeTypeInfo.inputs).map((key, i) => (
        <div key={key}>
          <Handle
            type="target"
            position={Position.Left}
            id={key}
            style={{ top: i * 20 + 20 }}
          />
          <div className="text-yellow-400">s-h: {key}</div>
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
            style={{ top: i * 20 + 20 }}
          />
          <div className="text-yellow-400">t-h: {key}</div>
          {/* debug */}
        </div>
      ))}
    </div>
  );
}
