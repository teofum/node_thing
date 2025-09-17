import { forwardRef } from "react";
import * as MB from "@radix-ui/react-menubar";
import cn from "classnames";

type MenubarProps = MB.MenubarProps;

export const Menubar = forwardRef<HTMLDivElement, MenubarProps>(
  ({ className, children, ...props }, forwardedRef) => {
    return (
      <MB.Root
        ref={forwardedRef}
        className={cn(
          "flex flex-row p-1 rounded-xl border border-white/15",
          className,
        )}
        {...props}
      >
        {children}
      </MB.Root>
    );
  },
);
Menubar.displayName = "Menubar";

type MenuProps = Omit<MB.MenubarProps & MB.MenubarTriggerProps, "asChild"> & {
  label: string;
};

export const Menu = forwardRef<HTMLButtonElement, MenuProps>(
  ({ className, children, label, ...props }, forwardedRef) => {
    return (
      <MB.Menu>
        <MB.Trigger
          ref={forwardedRef}
          className={cn(
            "text-sm/4 font-semibold rounded-lg cursor-pointer py-2 px-3",
            "transition-colors duration-150 hover:bg-current/10 data-[state=open]:bg-current/10",
            "focus-visible:outline outline-offset-0 outline-teal-400",
            "focus-visible:shadow-[0_0_0_3px] shadow-teal-400/30",
            className,
          )}
          {...props}
        >
          {label}
        </MB.Trigger>
        <MB.Portal>
          <MB.Content
            align="start"
            sideOffset={8}
            className="glass glass-border rounded-xl p-1 select-none"
          >
            {children}
          </MB.Content>
        </MB.Portal>
      </MB.Menu>
    );
  },
);
Menu.displayName = "Menu";

export const MenuGroup = MB.Group;

type MenuItemProps = MB.MenubarItemProps;

export const MenuItem = forwardRef<HTMLDivElement, MenuItemProps>(
  ({ className, children, ...props }, forwardedRef) => {
    return (
      <MB.Item
        ref={forwardedRef}
        className={cn(
          "min-w-40 select-none outline-none",
          "text-sm/4 rounded-lg cursor-pointer py-1.5 px-3",
          "transition-colors duration-150 hover:bg-current/10",
          className,
        )}
        {...props}
      >
        {children}
      </MB.Item>
    );
  },
);
MenuItem.displayName = "MenuItem";
