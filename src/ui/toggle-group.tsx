import { ComponentProps, forwardRef } from "react";
import {
  ToggleGroupItem,
  ToggleGroup as ToggleGroupPrimitive,
} from "@radix-ui/react-toggle-group";
import cn from "classnames";

type CommonProps = {
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: boolean;
};

function buttonClassnames(
  { variant = "default", size = "md", icon = false }: CommonProps,
  className?: string,
) {
  return cn(
    "font-semibold flex flex-row items-center justify-center gap-2",
    "data-[orientation=horizontal]:first:rounded-l-lg data-[orientation=horizontal]:last:rounded-r-lg",
    "data-[orientation=vertical]:first:rounded-t-lg data-[orientation=vertical]:last:rounded-b-lg",
    "cursor-pointer transition duration-150 data-[state=on]:text-teal-500",
    "focus-visible:outline outline-offset-0 outline-teal-400",
    "focus-visible:shadow-[0_0_0_3px] shadow-teal-400/30",
    {
      "p-1 text-xs/3": size === "sm",
      "p-2 text-sm/4": size === "md",
      "p-4 text-base/5": size === "lg",
      "px-3 min-w-16": !icon && size === "sm",
      "px-4 min-w-20": !icon && size === "md",
      "px-6 min-w-20": !icon && size === "lg",
      "border border-current/15": variant === "outline",
      "hover:bg-current/10 active:bg-current/15":
        variant === "outline" || variant === "ghost",
      "bg-gradient-to-b from-neutral-900 to-neutral-950 border-t border-b border-t-white/20 border-b-black/60 hover:from-neutral-800 hover:to-neutral-900 active:border-t-black/30 active:border-b-white/15 active:translate-y-px":
        variant === "default",
    },
    {
      "not-first:border-l-0 data-[state=on]:border-l has-[+[data-state=on]]:border-r-0":
        variant === "outline",
    },
    className,
  );
}
// orientation = "horizontal",
type ToggleGroupProps = ComponentProps<typeof ToggleGroupPrimitive> &
  CommonProps;

export const ToggleGroup = forwardRef<HTMLDivElement, ToggleGroupProps>(
  (
    { className, children, orientation = "horizontal", ...props },
    forwardedRef,
  ) => {
    return (
      <ToggleGroupPrimitive
        ref={forwardedRef}
        className={cn(
          "flex data-[orientation=horizontal]:flex-row data-[orientation=vertical]:flex-col",
          className,
        )}
        orientation={orientation}
        {...props}
      >
        {children}
      </ToggleGroupPrimitive>
    );
  },
);
ToggleGroup.displayName = "ToggleGroup";

type ToggleItemProps = ComponentProps<typeof ToggleGroupItem> & CommonProps;

export const ToggleItem = forwardRef<HTMLButtonElement, ToggleItemProps>(
  ({ className, children, variant, icon, ...props }, forwardedRef) => {
    return (
      <ToggleGroupItem
        ref={forwardedRef}
        className={buttonClassnames({ variant, icon }, className)}
        {...props}
      >
        {children}
      </ToggleGroupItem>
    );
  },
);
ToggleItem.displayName = "ToggleItem";
