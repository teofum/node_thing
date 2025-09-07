import React, { useRef, useState } from "react";
import { NODE_TYPES } from "@/utils/node-type";
import cn from "classnames";
import { LuGitFork, LuPin } from "react-icons/lu";
import useResizeObserver from "@/utils/use-resize-observer";

export function Sidebar() {
  const [pin, setPin] = useState(false);
  const [height, setHeight] = useState(0);
  const dummySizingDiv = useRef<HTMLDivElement | null>(null);

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("type", nodeType);
  };

  useResizeObserver(dummySizingDiv.current, () => {
    setHeight(dummySizingDiv.current?.clientHeight ?? 0);
  });

  return (
    <>
      <div
        className="absolute left-0 top-2 bottom-2 w-0"
        ref={dummySizingDiv}
      />
      <aside
        className={cn(
          "absolute left-2 top-2 z-10 w-48 flex flex-col rounded-xl group",
          "glass glass-border transition-[height] duration-300 overflow-hidden",
          { "not-hover:!h-[50px]": !pin },
        )}
        style={{ height }}
      >
        <div className="p-2 pl-4 flex flex-row gap-2 items-center min-h-12">
          <LuGitFork />
          <div className="font-semibold text-sm/4">Library</div>

          <button
            className={cn(
              "ml-auto w-8 h-8 rounded-lg grid place-items-center cursor-pointer",
              "transition duration-200 hover:bg-current/10",
              {
                "opacity-0 group-hover:opacity-100": !pin,
                "text-teal-500": pin,
              },
            )}
            onClick={() => setPin(!pin)}
          >
            <LuPin />
          </button>
        </div>
        <div className="border-t border-white/15 p-2 flex flex-col gap-3">
          {Object.entries(NODE_TYPES).map(([key, type]) => (
            <div
              key={key}
              className="p-3 border border-white/15 bg-black/40 rounded-md cursor-grab"
              onDragStart={(event) => onDragStart(event, key)}
              draggable
            >
              {type.name}
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}
