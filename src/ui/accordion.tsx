import React from "react";
import cn from "classnames";
import * as Accordion from "@radix-ui/react-accordion";
import { LuChevronDown } from "react-icons/lu";

type AccordionItemProps = React.ComponentPropsWithoutRef<typeof Accordion.Item>;

export const AccordionItem = React.forwardRef<
  React.ComponentRef<typeof Accordion.Item>,
  AccordionItemProps
>(({ children, className, ...props }, forwardedRef) => (
  <Accordion.Item
    className={cn(
      "overflow-hidden focus-within:relative focus-within:z-10 outline-none",
      className,
    )}
    {...props}
    ref={forwardedRef}
  >
    {children}
  </Accordion.Item>
));
AccordionItem.displayName = "AccordionItem";

type AccordionTriggerProps = React.ComponentPropsWithoutRef<
  typeof Accordion.Trigger
>;

export const AccordionTrigger = React.forwardRef<
  React.ComponentRef<typeof Accordion.Trigger>,
  AccordionTriggerProps
>(({ children, className, ...props }, forwardedRef) => (
  <Accordion.Header className="flex">
    <Accordion.Trigger
      onMouseDown={(e: React.MouseEvent) => e.preventDefault()}
      className={cn(
        "group flex flex-row flex-1 items-center justify-between px-3 py-2 border-b border-white/15 outline-none focus-visible:ring-2",
        className,
      )}
      {...props}
      ref={forwardedRef}
    >
      {children}
      <LuChevronDown
        className="transition-transform duration-200 ease-[cubic-bezier(0.87,_0,_0.13,_1)] group-data-[state=open]:rotate-180"
        aria-hidden
      />
    </Accordion.Trigger>
  </Accordion.Header>
));
AccordionTrigger.displayName = "AccordionTrigger";

type AccordionContentProps = React.ComponentPropsWithoutRef<
  typeof Accordion.Content
>;

export const AccordionContent = React.forwardRef<
  React.ComponentRef<typeof Accordion.Content>,
  AccordionContentProps
>(({ children, className, ...props }, ref) => (
  <Accordion.Content
    className={cn(
      "overflow-hidden",
      "data-[state=open]:animate-[accordionSlideDown_200ms_ease-out_forwards]",
      "data-[state=closed]:animate-[accordionSlideUp_200ms_ease-out_forwards]",
      className,
    )}
    {...props}
    ref={ref}
  >
    <div className="p-2">{children}</div>
  </Accordion.Content>
));
AccordionContent.displayName = "AccordionContent";
