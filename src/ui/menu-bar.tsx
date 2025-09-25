import { forwardRef } from "react";
import * as MB from "@radix-ui/react-menubar";
import cn from "classnames";
import { LuCheck } from "react-icons/lu";

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

type MenuProps = Omit<
  MB.MenubarMenuProps & MB.MenubarTriggerProps,
  "asChild"
> & {
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

export const menuItemClassNames = [
  "min-w-40 select-none outline-none flex flex-row gap-2",
  "text-sm/4 rounded-lg cursor-pointer py-1.5 px-3 pl-1",
  "transition-colors duration-150 hover:bg-current/10",
  "aria-[disabled]:text-white/40 aria-[disabled]:hover:bg-transparent aria-[disabled]:cursor-default",
];

type MenuItemProps = MB.MenubarItemProps & { icon?: React.ReactNode };

export const MenuItem = forwardRef<HTMLDivElement, MenuItemProps>(
  ({ className, children, icon, ...props }, forwardedRef) => {
    return (
      <MB.Item
        ref={forwardedRef}
        className={cn(...menuItemClassNames, className)}
        {...props}
      >
        <div className="w-4 h-4 min-w-4 max-w-4 p-px">{icon}</div>
        {children}
      </MB.Item>
    );
  },
);
MenuItem.displayName = "MenuItem";

type MenuCheckboxItemProps = MB.MenubarCheckboxItemProps;

export const MenuCheckboxItem = forwardRef<
  HTMLDivElement,
  MenuCheckboxItemProps
>(({ className, children, ...props }, forwardedRef) => {
  return (
    <MB.CheckboxItem
      ref={forwardedRef}
      className={cn(...menuItemClassNames, className)}
      {...props}
    >
      <div className="w-4 h-4 min-w-4 max-w-4">
        <MB.ItemIndicator>
          <LuCheck className="text-base" />
        </MB.ItemIndicator>
      </div>
      {children}
    </MB.CheckboxItem>
  );
});
MenuCheckboxItem.displayName = "MenuCheckboxItem";

export const MenuRadioGroup = MB.RadioGroup;

type MenuRadioItemProps = MB.MenubarRadioItemProps;

export const MenuRadioItem = forwardRef<HTMLDivElement, MenuRadioItemProps>(
  ({ className, children, ...props }, forwardedRef) => {
    return (
      <MB.RadioItem
        ref={forwardedRef}
        className={cn(...menuItemClassNames, className)}
        {...props}
      >
        <div className="w-4 h-4 min-w-4 max-w-4">
          <MB.ItemIndicator>
            <LuCheck className="text-base" />
          </MB.ItemIndicator>
        </div>
        {children}
      </MB.RadioItem>
    );
  },
);
MenuRadioItem.displayName = "MenuRadioItem";

type MenuSeparatorProps = MB.MenubarSeparatorProps;

export const MenuSeparator = forwardRef<HTMLDivElement, MenuSeparatorProps>(
  ({ className, ...props }, forwardedRef) => {
    return (
      <MB.Separator
        ref={forwardedRef}
        className={cn("border-b border-white/15 m-1", className)}
        {...props}
      />
    );
  },
);
MenuSeparator.displayName = "MenuSeparator";
