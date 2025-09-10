import React, { Fragment, useLayoutEffect, useRef, useState } from "react";
import { LuGitFork, LuPin } from "react-icons/lu";
import { Accordion } from "radix-ui";
import { LuChevronDown } from "react-icons/lu";
import cn from "classnames";

import { NODE_TYPES } from "@/utils/node-type";
import useResizeObserver from "@/utils/use-resize-observer";
import { ToggleButton } from "@/ui/button";
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
            className="AccordionRoot"
            type="single"
            collapsible>
            {Object.entries(nodesByCategory).map(([category, types]) => (
              <Fragment key={category}>
                <AccordionItem className="AccordionItem" value={category}>
                  <AccordionTrigger>{category}</AccordionTrigger>
                  <AccordionContent>
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

type AccordionItemProps = React.ComponentPropsWithoutRef<typeof Accordion.Item>;

const AccordionItem = React.forwardRef<
  React.ComponentRef<typeof Accordion.Item>,
  AccordionItemProps
>(({ children, className, ...props }, forwardedRef) => (
  <Accordion.Item
    className={cn(
      "mt-px overflow-hidden first:mt-0 first:rounded-t last:rounded-b focus-within:relative focus-within:z-10 focus-within:shadow-[0_0_0_2px] focus-within:shadow-mauve12",
      className
    )}
    {...props}
    ref={forwardedRef}
  >
    {children}
  </Accordion.Item>
));

type AccordionTriggerProps = React.ComponentPropsWithoutRef<
  typeof Accordion.Trigger
>;

const AccordionTrigger = React.forwardRef<
  React.ComponentRef<typeof Accordion.Trigger>,
  AccordionTriggerProps
>(({ children, className, ...props }, forwardedRef) => (
  <Accordion.Header className="flex">
    <Accordion.Trigger
      className={cn(
        "group flex h-[45px] flex-1 cursor-default items-center justify-between bg-mauve1 px-5 text-[15px] leading-none text-violet11 shadow-[0_1px_0] shadow-mauve6 outline-none hover:bg-mauve2",
        className
      )}
      {...props}
      ref={forwardedRef}
    >
      {children}
      <LuChevronDown
        className="text-violet10 transition-transform duration-300 ease-[cubic-bezier(0.87,_0,_0.13,_1)] group-data-[state=open]:rotate-180"
        aria-hidden
      />
    </Accordion.Trigger>
  </Accordion.Header>
));

type AccordionContentProps = React.ComponentPropsWithoutRef<
  typeof Accordion.Content
>;

const AccordionContent = React.forwardRef<
  React.ComponentRef<typeof Accordion.Content>,
  AccordionContentProps
>(({ children, className, ...props }, ref) => (
  <Accordion.Content
    className={cn(
      "overflow-hidden bg-mauve2 text-[15px] text-mauve11 data-[state=closed]:animate-slideUp data-[state=open]:animate-slideDown",
      className
    )}
    {...props}
    ref={ref}
  >
    <div className="px-2 py-[15px]">{children}</div>
  </Accordion.Content>
));