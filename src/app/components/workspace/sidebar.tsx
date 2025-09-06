import React, { useState } from "react";
import { NODE_TYPES } from "@/utils/node-type";
import cn from "classnames";
import { LuChevronsUp } from "react-icons/lu";

export function Sidebar() {
  const [hideSidebar, setHideSidebar] = useState(false);

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("type", nodeType);
  };

  return (
    <>
      <aside
        className={cn(
          "absolute left-2 top-2 z-10 w-48 flex flex-col rounded-xl",
          "glass glass-border",
          { "bottom-2": !hideSidebar },
        )}
      >
        <div className="p-2 pl-4 flex flex-row gap-2 items-center">
          <div className="font-semibold">Add nodes</div>

          <button
            className={cn(
              "ml-auto w-8 h-8 rounded grid place-items-center cursor-pointer",
              "transition-colors duration-100 hover:bg-white/10",
            )}
            onClick={() => setHideSidebar(!hideSidebar)}
          >
            <LuChevronsUp
              className={cn("transition-transform duration-200", {
                "rotate-180": hideSidebar,
              })}
            />
          </button>
        </div>
        {!hideSidebar ? (
          <div className="border-t border-white/15 p-2 flex flex-col gap-3">
            {Object.entries(NODE_TYPES).map(([key, type]) => (
              <div
                key={key}
                className="p-3 border border-white/15 bg-black rounded-md"
                onDragStart={(event) => onDragStart(event, key)}
                draggable
              >
                {type.name}
              </div>
            ))}
          </div>
        ) : null}
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
