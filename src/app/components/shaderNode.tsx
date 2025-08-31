// nodo elemental para cada shader del proyecto

// nota: no se debería usar los hooks de React Flow, se debería manejar nodes y edges cion las funciones que están definidas en este archivo

import { Handle, Position } from "@xyflow/react";
import { Edge, Node } from "@/schemas/node.schema";

export type ShaderNodeProps = {
  id: string;
  data: { node: Node };
};

export function ShaderNode({ id, data }: ShaderNodeProps) {
  const { node } = data; // TODO, acá agregaríamos los valores de runtime

  // TODO acá habría que renderizar y mostrar menú para cada atributo y demás
  // TODO tmb varíar la cantidad de <Handle />s

  return (
    <div className="p-2">
      {/* TODO por ahora imprimo solo el id para testear */}
      <div className=" text-blue-400">{node.id}</div>
      <Handle type="source" position={Position.Right} />
      <Handle type="target" position={Position.Left} />
    </div>
  );
}
