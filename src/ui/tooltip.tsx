import { forwardRef, ComponentPropsWithoutRef, ReactNode } from "react";
import cn from "classnames";
import * as RadixTooltip from "@radix-ui/react-tooltip";

type TooltipProps = {
  children: ReactNode;
  content: ReactNode;
  delay?: number;
} & ComponentPropsWithoutRef<typeof RadixTooltip.Content>;

export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  (
    {
      children,
      content,
      delay = 700,
      className,
      side = "top",
      sideOffset = 5,
      ...props
    },
    ref,
  ) => {
    return content ? (
      <RadixTooltip.Provider>
        <RadixTooltip.Root delayDuration={delay}>
          <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
          <RadixTooltip.Portal>
            <RadixTooltip.Content
              ref={ref}
              side={side}
              sideOffset={sideOffset}
              className={cn(
                "rounded-xl bg-neutral-700 px-[15px] py-2.5",
                className,
              )}
              {...props}
            >
              {content}
              <RadixTooltip.Arrow className="fill-neutral-700" />
            </RadixTooltip.Content>
          </RadixTooltip.Portal>
        </RadixTooltip.Root>
      </RadixTooltip.Provider>
    ) : (
      <div>{children}</div>
    );
  },
);

Tooltip.displayName = "Tooltip";
