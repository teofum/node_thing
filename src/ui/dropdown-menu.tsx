import React from "react";
import * as DM from "@radix-ui/react-dropdown-menu";
import cn from "classnames";

import { menuItemClassNames } from "./menu-bar";

type MenuProps = Omit<
  DM.DropdownMenuProps & DM.DropdownMenuTriggerProps,
  "asChild"
> & {
  trigger: React.ReactNode;
};

export const DropdownMenu = ({
  className,
  children,
  trigger,
  ...props
}: MenuProps) => (
  <DM.Root>
    <DM.Trigger asChild {...props}>
      {trigger}
    </DM.Trigger>
    <DM.Portal>
      <DM.Content
        side="right"
        sideOffset={4}
        align="center"
        className={cn(
          "glass glass-border rounded-xl p-1 select-none",
          className,
        )}
      >
        {children}
      </DM.Content>
    </DM.Portal>
  </DM.Root>
);

type MenuItemProps = DM.DropdownMenuItemProps & {
  icon?: React.ReactNode;
};

export const DropdownMenuItem = ({
  className,
  children,
  icon,
  ...props
}: MenuItemProps) => (
  <DM.Item className={cn(menuItemClassNames, className)} {...props}>
    <div className="w-4 h-4 min-w-4 max-w-4 p-px">{icon}</div>
    {children}
  </DM.Item>
);
