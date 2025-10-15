import * as CM from "@radix-ui/react-context-menu";
import cn from "classnames";
import React, { forwardRef } from "react";
import { LuChevronRight } from "react-icons/lu";

import { menuItemClassNames } from "./menu-bar";

type MenuProps = Omit<
  CM.ContextMenuProps & CM.ContextMenuTriggerProps,
  "asChild"
> & {
  trigger: React.ReactNode;
};

export const ContextMenu = ({
  className,
  children,
  trigger,
  ...props
}: MenuProps) => (
  <CM.Root>
    <CM.Trigger asChild {...props}>
      {trigger}
    </CM.Trigger>
    <CM.Portal>
      <CM.Content
        className={cn(
          "glass glass-border rounded-xl p-1 select-none",
          className,
        )}
      >
        {children}
      </CM.Content>
    </CM.Portal>
  </CM.Root>
);

type MenuItemProps = CM.ContextMenuItemProps & {
  icon?: React.ReactNode;
};

export const ContextMenuItem = ({
  className,
  children,
  icon,
  ...props
}: MenuItemProps) => (
  <CM.Item className={cn(menuItemClassNames, className)} {...props}>
    <div className="w-4 h-4 min-w-4 max-w-4 p-px">{icon}</div>
    {children}
  </CM.Item>
);

type SubmenuProps = CM.ContextMenuSubProps &
  CM.ContextMenuSubTriggerProps & {
    label: string;
    icon?: React.ReactNode;
  };

export const ContextSubmenu = forwardRef<HTMLDivElement, SubmenuProps>(
  ({ children, className, label, icon, ...props }, forwardedRef) => {
    return (
      <CM.Sub>
        <CM.SubTrigger
          ref={forwardedRef}
          className={cn(...menuItemClassNames, className)}
          {...props}
        >
          <div className="w-4 h-4 min-w-4 max-w-4 p-px">{icon}</div>
          {label}
          <div className="w-4 h-4 min-w-4 max-w-4 p-px ml-auto -mr-2">
            <LuChevronRight />
          </div>
        </CM.SubTrigger>
        <CM.Portal>
          <CM.SubContent className="glass glass-border rounded-xl p-1 select-none">
            {children}
          </CM.SubContent>
        </CM.Portal>
      </CM.Sub>
    );
  },
);
ContextSubmenu.displayName = "Submenu";
