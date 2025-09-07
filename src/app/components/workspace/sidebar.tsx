import React, { useState } from "react";
import { NODE_TYPES } from "@/utils/node-type";
import cn from "classnames";
import { LuGitFork, LuPin } from "react-icons/lu";

export function Sidebar() {
  const [pin, setPin] = useState(false);

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("type", nodeType);
  };

  return (
    <aside
      className={cn(
        "absolute left-2 top-2 z-10 w-48 flex flex-col rounded-xl group",
        "glass glass-border",
        { "bottom-2": pin, "hover:bottom-2": !pin },
      )}
    >
      <div className="p-2 pl-4 flex flex-row gap-2 items-center min-h-12">
        <LuGitFork />
        <div className="font-semibold text-sm/4">Library</div>

        <button
          className={cn(
            "ml-auto w-8 h-8 rounded-lg grid place-items-center cursor-pointer",
            "transition-colors duration-100 hover:bg-white/10",
            { "hidden group-hover:block": !pin },
          )}
          onClick={() => setPin(!pin)}
        >
          <LuPin
            className={cn("transition-colors duration-100", {
              "text-teal-500": pin,
            })}
          />
        </button>
      </div>
      <div
        className={cn("border-t border-white/15 p-2 flex-col gap-3", {
          "hidden group-hover:flex": !pin,
          flex: pin,
        })}
      >
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
    </aside>
  );
}
