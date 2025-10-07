import * as P from "@radix-ui/react-popover";
import cn from "classnames";
import { forwardRef } from "react";

type PopoverProps = Omit<P.PopoverProps & P.PopoverContentProps, "asChild"> & {
  trigger: React.ReactNode;
};

export const Popover = forwardRef<HTMLDivElement, PopoverProps>(
  (
    { className, children, trigger, open, onOpenChange, ...props },
    forwardedRef,
  ) => (
    <P.Root open={open} onOpenChange={onOpenChange}>
      <P.Trigger asChild>{trigger}</P.Trigger>
      <P.Portal>
        <P.Content
          ref={forwardedRef}
          className={cn("glass glass-border rounded-xl p-3 z-100", className)}
          {...props}
        >
          {children}
        </P.Content>
      </P.Portal>
    </P.Root>
  ),
);
Popover.displayName = "Popover";
