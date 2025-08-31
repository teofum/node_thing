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

// a lo que quiero llegar es:

// const initialNodes: Node[] = [
//   // TODO !!!!! acá lo de tipos con el JSON schema
//   // el key/campo "type" determina el renderer a ser utilizado
//   // hay que primero definirlos (o hacer un factory genérico) y luego registrarlos en nodeTypes para luego mandarlo como prop a <ReactFlow />
//   {
//     id: "1",
//     type: "shaderNode", // !!
//     data: { label: "input node", schema:  }, // !!
//     position: { x: 250, y: 5 },
//   },
