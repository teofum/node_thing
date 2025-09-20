import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import cn from "classnames";
import React from "react";

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

export const DropdownMenuContent = ({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      side="right"
      sideOffset={17}
      align="center"
      className={cn(
        "rounded-lg border border-white/15 bg-neutral-900 p-1 text-sm",
        className,
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
);

export const DropdownMenuItem = ({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item>) => (
  <DropdownMenuPrimitive.Item
    className={cn(
      "cursor-pointer select-none rounded-md px-3 py-2 text-white/80 outline-none hover:bg-white/10 hover:text-white",
      className,
    )}
    {...props}
  />
);
