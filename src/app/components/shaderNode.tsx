// nodo elemental para cada shader del proyecto

// nota: no usar los hooks de React Flow, usar directamente nuestro store del zustand en store.ts

import { Handle, Position } from "@xyflow/react";
import { Edge, Node } from "@/schemas/node.schema";
import { NODE_TYPES } from "@/utils/node-type";

// TODO, ShaderNode por ahora solamente recibe node: Node (el de node.shema.ts)
// puede que querramos guardar el código del shader en formato string dentro del objeto data:
export type ShaderNodeProps = {
  id: string;
  data: { node: Node };
};

export function ShaderNode({ id, data }: ShaderNodeProps) {
  const { node } = data;
  const nodeTypeInfo = NODE_TYPES[node.type];

  // TODO acá habría que renderizar y mostrar menú para cada atributo y demás

  // TODO node.id y id son diferentes (estandarziar para que quede uno)

  return (
    <div className="p-2 bg-amber-500">
      <div className=" text-blue-400">{node.id}</div> {/* debug */}
      <div className="text-xs text-gray-400 mb-2">{nodeTypeInfo.name}</div>{" "}
      {/* debug */}
      {/*
       * NOTA: React Flow usa internamente Handle id y Edge sourceHandle/targetHandle para identificar handles
       * sería luego conectarlo con nuestro Edge del schema
       */}
      {/* dinámicamente chequeo campos de inputs y outputs para imprimir Handles */}
      {/* inputs */}
      {Object.entries(nodeTypeInfo.inputs).map(([key], index) => (
        <>
          <Handle type="source" position={Position.Left} id={key.toString()} />
          <div className=" text-yellow-400">s-h: {key.toString()}</div>{" "}
          {/* debug */}
        </>
      ))}
      {/* outputs */}
      {Object.entries(nodeTypeInfo.outputs).map(([key], index) => (
        <>
          <Handle type="target" position={Position.Right} id={key.toString()} />
          <div className=" text-yellow-400">t-h: {key.toString()}</div>{" "}
          {/* debug */}
        </>
      ))}
    </div>
  );
}
