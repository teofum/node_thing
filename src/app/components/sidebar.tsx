// TODO pasar a TSX

import React from "react";
import { useDnD } from "./dndContext";

export function Sidebar() {
  const [_, setType] = useDnD();

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    if (!setType) return;
    setType(nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside>
      <div className="description">Panel izquierdo</div>
      <div
        className="dndnode input"
        onDragStart={(event) => onDragStart(event, "input")}
        draggable
      >
        Input Node
      </div>
      <div
        className="dndnode"
        onDragStart={(event) => onDragStart(event, "default")}
        draggable
      >
        Default Node
      </div>
      <div
        className="dndnode output"
        onDragStart={(event) => onDragStart(event, "output")}
        draggable
      >
        Output Node
      </div>
    </aside>
  );
}
