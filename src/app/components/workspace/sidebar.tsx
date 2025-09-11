import React, { Fragment, useLayoutEffect, useRef, useState } from "react";
import { LuGitFork, LuPin } from "react-icons/lu";
import cn from "classnames";

import { NODE_TYPES } from "@/utils/node-type";
import useResizeObserver from "@/utils/use-resize-observer";
import { ToggleButton } from "@/ui/button";
import * as Accordion from "@radix-ui/react-accordion";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/ui/accordion";
import { NodeType } from "@/schemas/node.schema";

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
  useLayoutEffect(() => {
    setHeight(dummySizingDiv.current?.clientHeight ?? 0);
  }, []);

  // Group nodes by category
  const nodesByCategory: Record<string, Record<string, NodeType>> = {};
  Object.entries(NODE_TYPES)
    .filter(([key]) => !key.startsWith("__"))
    .forEach(([key, type]) => {
      if (!nodesByCategory[type.category]) nodesByCategory[type.category] = {};
      nodesByCategory[type.category][key] = type;
    });

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
          <LuGitFork />
          <div className="font-semibold text-sm/4">Library</div>

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
        <div className="border-t border-white/15 p-2 flex flex-col gap-3 min-h-0 overflow-auto">
          <Accordion.Root
            type="single"
            collapsible>
            {Object.entries(nodesByCategory).map(([category, types]) => (
              <Fragment key={category}>
                <AccordionItem value={category}>
                  <AccordionTrigger className="font-semibold text-sm/4 bg-white/2 hover:bg-white/8 transition duration-70">{category}</AccordionTrigger>
                  <AccordionContent className="font-semibold">
                    <div className="flex flex-col gap-2">
                      {Object.entries(types).map(([key, type]) => (
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
                  </AccordionContent>
                </AccordionItem>
              </Fragment>
            ))}
          </Accordion.Root>
        </div>
      </aside>
    </>
  );
}