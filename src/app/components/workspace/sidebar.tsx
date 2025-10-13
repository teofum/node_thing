import React, { useLayoutEffect, useRef, useState } from "react";
import { LuGitFork, LuPin, LuLayers, LuImage, LuPlay } from "react-icons/lu";
import cn from "classnames";

import useResizeObserver from "@/utils/use-resize-observer";
import { ToggleButton } from "@/ui/button";
import { Select, SelectItem } from "@/ui/select";
import { MenuLayers } from "./menu-layers";
import { MenuLibrary } from "./menu-library";
import { MenuAssets } from "./menu-assets";
import { MenuAnimation } from "./menu-animation";

export function Sidebar() {
  const [pin, setPin] = useState(false);
  const [height, setHeight] = useState(0);
  const [menu, setMenu] = useState<
    "library" | "layers" | "assets" | "animation"
  >("library");
  const dummySizingDiv = useRef<HTMLDivElement | null>(null);

  const renderMenu = () => {
    switch (menu) {
      case "library":
        return <MenuLibrary />;
      case "layers":
        return <MenuLayers />;
      case "assets":
        return <MenuAssets />;
      case "animation":
        return <MenuAnimation />;
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
          "absolute left-1 top-1 z-10 w-56 flex flex-col rounded-xl group p-px",
          "transition-[height] duration-300 overflow-hidden",
          { "not-hover:!h-[50px]": !pin },
        )}
        style={{ height }}
      >
        <div className="absolute inset-0 glass glass-border rounded-[inherit]" />
        <div className="p-0.75 pr-2 flex flex-row gap-2 items-center min-h-12 relative z-10 mb-px">
          <Select
            variant="ghost"
            value={menu}
            onValueChange={(value: typeof menu) =>
              setMenu(value as typeof menu)
            }
          >
            <SelectItem value="library">
              <div className="flex items-center gap-2">
                <LuGitFork className="text-base" />
                <div className="font-semibold">Library</div>
              </div>
            </SelectItem>

            <SelectItem value="layers">
              <div className="flex items-center gap-2">
                <LuLayers className="text-base" />
                <div className="font-semibold">Layers</div>
              </div>
            </SelectItem>

            <SelectItem value="assets">
              <div className="flex items-center gap-2">
                <LuImage className="text-base" />
                <div className="font-semibold">Assets</div>
              </div>
            </SelectItem>

            <SelectItem value="animation">
              <div className="flex items-center gap-2">
                <LuPlay className="text-base" />
                <div className="font-semibold">Animation</div>
              </div>
            </SelectItem>
          </Select>

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

        <div className="relative z-10 min-h-0 flex flex-col grow">
          {renderMenu()}
        </div>
      </aside>
    </>
  );
}
