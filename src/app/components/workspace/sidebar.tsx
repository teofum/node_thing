import React from "react";
import { NODE_TYPES } from "@/utils/node-type";
import cn from "classnames";

export function Sidebar({
  hideSidebar,
  setHideSidebar,
}: {
  hideSidebar: boolean;
  setHideSidebar: (v: boolean) => void;
}) {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("type", nodeType);
  };

  return (
    <>
      <aside
        className={cn(
          "absolute top-2 bottom-2 z-10 flex flex-col rounded-lg p-2 overflow-hidden",
          "bg-gradient-to-b from-gray-500/20 via-gray-600/20 to-gray-700/20",
          "backdrop-blur-sm border border-gray-700 shadow-lg transition-all duration-50",
          hideSidebar ? "left-0 w-2" : "left-2 w-52",
        )}
      >
        {!hideSidebar &&
          Object.entries(NODE_TYPES).map(([key, type]) => (
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

      <button
        className={cn(
          "absolute top-1/2 w-6 h-14 items-center justify-center",
          "bg-gradient-to-b from-gray-500/20 via-gray-600/20 to-gray-700/20",
          "backdrop-blur-sm border border-gray-700 border-l-0 shadow-lg rounded",
          "hover:bg-gray-700 transition",
          hideSidebar ? "left-[16px]" : "left-[214px]", // esto hardcodeado dependiendo del tamaño de sidebar (también hardcodeado)
        )}
        onClick={() => setHideSidebar(!hideSidebar)}
      >
        {hideSidebar ? ">" : "<"}
      </button>
    </>
  );
}
