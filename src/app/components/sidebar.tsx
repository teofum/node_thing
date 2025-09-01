import React from "react";
import { NODE_TYPES } from "@/utils/node-type";

export function Sidebar() {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("type", nodeType);
  };

  // TODO acá se quiere renderizar todas las opcioens para cada shader
  // serían todos del tipo ShaderNode, pero tienen su tipo real guardado en el campo data.
  return (
    <aside>
      {Object.entries(NODE_TYPES).map(([key, type]) => (
        <div
          key={key}
          className=""
          onDragStart={(event) => onDragStart(event, key)}
          draggable
        >
          {type.name}
        </div>
      ))}
    </aside>
  );
}
