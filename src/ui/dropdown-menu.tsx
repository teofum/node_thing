import React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import cn from "classnames";

import { menuItemClassNames } from "./menu-bar";

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

export const DropdownMenuContent = ({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      side="right"
      sideOffset={4}
      align="center"
      className={cn("glass glass-border rounded-xl p-1 select-none", className)}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
);

type MenuItemProps = DropdownMenuPrimitive.DropdownMenuItemProps & {
  icon?: React.ReactNode;
};

export const DropdownMenuItem = ({
  className,
  children,
  icon,
  ...props
}: MenuItemProps) => (
  <DropdownMenuPrimitive.Item
    className={cn(menuItemClassNames, className)}
    {...props}
  >
    <div className="w-4 h-4 min-w-4 max-w-4 p-px">{icon}</div>
    {children}
  </DropdownMenuPrimitive.Item>
);
