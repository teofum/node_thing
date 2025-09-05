import React from "react";
import { NODE_TYPES } from "@/utils/node-type";
import cn from "classnames";

export function Sidebar() {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("type", nodeType);
  };

  return (
    <aside className="absolute left-2 top-2 bottom-2 w-52 z-10 flex flex-col rounded p-2 overflow-auto bg-gradient-to-b to-gray-700/20 via-gray-600/20 from-gray-500/20 backdrop-blur-sm border border-gray-700 shadow-lg">
      {Object.entries(NODE_TYPES).map(([key, type]) => (
        <div
          key={key}
          className="p-3 m-3 border-2 bg-black rounded-md"
          onDragStart={(event) => onDragStart(event, key)}
          draggable
        >
          {type.name}
        </div>
      ))}
    </aside>
  );
}
