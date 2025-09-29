import { forwardRef } from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { LuChevronDown, LuChevronUp } from "react-icons/lu";
import cn from "classnames";

type Props = Omit<SelectPrimitive.SelectProps, "children"> &
  Pick<SelectPrimitive.SelectTriggerProps, "className"> &
  Pick<SelectPrimitive.SelectValueProps, "placeholder"> &
  Pick<SelectPrimitive.SelectViewportProps, "children"> & {
    size?: "sm" | "md";
    variant?: "default" | "outline" | "ghost";
  };

export const Select = forwardRef<HTMLButtonElement, Props>(
  (
    {
      className,
      children,
      placeholder,
      variant = "default",
      size = "md",
      ...props
    },
    forwardedRef,
  ) => {
    return (
      <SelectPrimitive.Root {...props}>
        <SelectPrimitive.Trigger
          ref={forwardedRef}
          className={cn(
            "flex items-center justify-between w-full cursor-pointer",
            "rounded-lg placeholder:text-white/40",
            "outline-0 transition duration-150",
            {
              "border focus-visible:border-teal-400 focus-visible:outline-2 outline-teal-400/30 hover:bg-current/10":
                variant === "outline" || variant === "ghost",
              "border-current/15": variant === "outline",
              "border-transparent": variant === "ghost",
              "border-b border-t border-black/30 border-b-white/10 bg-border bg-gradient-to-b from-white/2 to-white/5 focus-visible:outline outline-teal-400 focus-visible:shadow-[0_0_0_3px] shadow-teal-400/30":
                variant === "default",
              "p-1.5 text-xs/3": size === "sm",
              "p-3 text-sm/4": size === "md",
            },
            className,
          )}
        >
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon>
            <LuChevronDown />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content className="bg-black/60 backdrop-blur-md border border-white/15 rounded-xl">
            <SelectPrimitive.ScrollUpButton>
              <LuChevronUp />
            </SelectPrimitive.ScrollUpButton>

            <SelectPrimitive.Viewport className="p-1 flex flex-col gap-1">
              {children}
            </SelectPrimitive.Viewport>

            <SelectPrimitive.ScrollDownButton>
              <LuChevronDown />
            </SelectPrimitive.ScrollDownButton>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    );
  },
);
Select.displayName = "Select";

type ItemProps = SelectPrimitive.SelectItemProps & {
  size?: "sm" | "md";
};

export const SelectItem = forwardRef<HTMLDivElement, ItemProps>(
  function SelectItemComponent(
    { className, children, value, size = "md", ...props },
    ref,
  ) {
    return (
      <SelectPrimitive.Item
        ref={ref}
        className={cn(
          "select-none rounded-lg data-[state=checked]:bg-white/5 hover:bg-white/10",
          "outline-none outline-teal-400/30 outline-2 focus-visible:outline-solid",
          {
            "p-1.5 text-xs/3": size === "sm",
            "p-3 text-sm/4": size === "md",
          },
          className,
        )}
        value={value}
        {...props}
      >
        <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      </SelectPrimitive.Item>
    );
  },
);
