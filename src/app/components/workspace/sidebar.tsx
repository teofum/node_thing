import React, { useLayoutEffect, useRef, useState } from "react";
import { LuGitFork, LuPin, LuLayers } from "react-icons/lu";
import { FaAngleDown } from "react-icons/fa6";
import cn from "classnames";

import useResizeObserver from "@/utils/use-resize-observer";
import { ToggleButton } from "@/ui/button";
import { MenuLayers } from "./menu-layers";
import { MenuLibrary } from "./menu-library";
import { RiStackLine } from "react-icons/ri";
import * as Select from "@radix-ui/react-select";

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
          {menu === "layers" && <LuLayers />}
          <Select.Root
            value={menu}
            onValueChange={(value) => setMenu(value as "library" | "layers")}
          >
            <Select.Trigger className="flex items-center justify-between font-semibold text-sm/4 bg-black/85 border border-white/15 rounded p-1 w-full">
              <Select.Value />
              <Select.Icon>
                <FaAngleDown />
              </Select.Icon>
            </Select.Trigger>

            <Select.Portal>
              <Select.Content className="bg-black/85 border border-white/15 rounded-md">
                <Select.Viewport className="p-1">
                  <Select.Item
                    value="library"
                    className="px-2 py-1 rounded hover:bg-white/10 cursor-pointer"
                  >
                    <Select.ItemText>Library</Select.ItemText>
                  </Select.Item>
                  <Select.Item
                    value="layers"
                    className="px-2 py-1 rounded hover:bg-white/10 cursor-pointer"
                  >
                    <Select.ItemText>Layers</Select.ItemText>
                  </Select.Item>
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>

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
