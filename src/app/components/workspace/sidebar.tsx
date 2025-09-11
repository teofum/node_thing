import React, { useLayoutEffect, useRef, useState } from "react";
import { LuGitFork, LuPin } from "react-icons/lu";
import cn from "classnames";

import useResizeObserver from "@/utils/use-resize-observer";
import { ToggleButton } from "@/ui/button";
import { MenuLayers } from "./menu-layers";
import { MenuLibrary } from "./menu-library";
import { RiStackLine } from "react-icons/ri";

export function Sidebar() {
  const [pin, setPin] = useState(false);
  const [height, setHeight] = useState(0);
  const dummySizingDiv = useRef<HTMLDivElement | null>(null);
  const [menu, setMenu] = useState<"library" | "layers">("library");

  const renderMenu = () => {
    switch (menu) {
      case "layers":
        return <MenuLayers />;
      case "library":
        return <MenuLibrary />;
      default:
        return null;
    }
  };

  useResizeObserver(dummySizingDiv.current, () => {
    setHeight(dummySizingDiv.current?.clientHeight ?? 0);
  });
  useLayoutEffect(() => {
    setHeight(dummySizingDiv.current?.clientHeight ?? 0);
  }, []);

  return (
    <>
      <div
        className="absolute left-0 top-1 bottom-1 w-0"
        ref={dummySizingDiv}
      />
      <aside
        className={cn(
          "absolute left-1 top-1 z-10 w-48 flex flex-col rounded-xl group",
          "glass glass-border transition-[height] duration-300 overflow-hidden",
          { "not-hover:!h-[50px]": !pin },
        )}
        style={{ height }}
      >
        <div className="p-2 pl-4 flex flex-row gap-2 items-center min-h-12">
          {menu === "library" && <LuGitFork />}
          {menu === "layers" && <RiStackLine />}
          <select
            className="font-semibold text-sm/4 bg-black/85 border border-white/15 rounded p-1 w-full"
            value={menu}
            onChange={(e) => setMenu(e.target.value as "library" | "layers")}
          >
            <option value="library">Library</option>
            <option value="layers">Layers</option>
          </select>

          <ToggleButton
            icon
            variant="ghost"
            className={cn("ml-auto", {
              "opacity-0 group-hover:opacity-100": !pin,
            })}
            pressed={pin}
            onPressedChange={setPin}
          >
            <LuPin />
          </ToggleButton>
        </div>
        {renderMenu()}
      </aside>
    </>
  );
}
