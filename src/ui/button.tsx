import { Toggle } from "@radix-ui/react-toggle";
import cn from "classnames";
import Link from "next/link";
import { ComponentProps, forwardRef } from "react";

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
    "font-semibold text-white rounded-lg",
    "flex flex-row items-center justify-center gap-2",
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
      "hover:bg-current/10": variant === "outline" || variant === "ghost",
      "bg-gradient-to-b from-neutral-900 to-neutral-950 border-t border-b border-t-white/20 border-b-black/60 hover:from-neutral-800 hover:to-neutral-900 active:border-t-black/30 active:border-b-white/15 active:translate-y-px":
        variant === "default",
    },
    className,
  );
}

type ButtonProps = ComponentProps<"button"> & CommonProps;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function ButtonImpl(
    { className, children, variant, size, icon, ...props },
    forwardedRef,
  ) {
    return (
      <button
        ref={forwardedRef}
        className={buttonClassnames({ variant, size, icon }, className)}
        {...props}
      >
        {children}
      </button>
    );
  },
);

type LinkButtonProps = ComponentProps<typeof Link> & CommonProps;

export const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(
  function LinkButtonImpl(
    { className, children, variant, size, icon, ...props },
    forwardedRef,
  ) {
    return (
      <Link
        ref={forwardedRef}
        className={buttonClassnames({ variant, size, icon }, className)}
        {...props}
      >
        {children}
      </Link>
    );
  },
);

type ToggleButtonProps = ComponentProps<typeof Toggle> & CommonProps;

export const ToggleButton = forwardRef<HTMLButtonElement, ToggleButtonProps>(
  function ButtonImpl(
    { className, children, variant, icon, ...props },
    forwardedRef,
  ) {
    return (
      <Toggle
        ref={forwardedRef}
        className={buttonClassnames({ variant, icon }, className)}
        {...props}
      >
        {children}
      </Toggle>
    );
  },
);
