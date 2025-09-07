import cn from "classnames";
import Link from "next/link";
import { ComponentProps, forwardRef } from "react";

type CommonProps = {
  variant?: "default" | "outline" | "ghost";
  icon?: boolean;
};

type ButtonProps = ComponentProps<"button"> & CommonProps;

function buttonClassnames(
  { variant = "default", icon = false }: CommonProps,
  className?: string,
) {
  return cn(
    "p-2 text-sm/4 font-semibold text-white rounded-lg",
    "flex flex-row items-center justify-center gap-2",
    "cursor-pointer transition duration-150",
    "focus-visible:outline outline-offset-0 outline-teal-400",
    "focus-visible:shadow-[0_0_0_3px] shadow-teal-400/30",
    {
      "px-4 min-w-20": !icon,
      "border border-current/15": variant === "outline",
      "hover:bg-current/10": variant === "outline" || variant === "ghost",
      "bg-gradient-to-b from-neutral-900 to-neutral-950 border-t border-b border-t-white/20 border-b-black/60 hover:from-neutral-800 hover:to-neutral-900 active:border-t-black/30 active:border-b-white/15 active:translate-y-px":
        variant === "default",
    },
    className,
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function ButtonImpl(
    { className, children, variant, icon, ...props },
    forwardedRef,
  ) {
    return (
      <button
        ref={forwardedRef}
        className={buttonClassnames({ variant, icon }, className)}
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
    { className, children, variant, icon, ...props },
    forwardedRef,
  ) {
    return (
      <Link
        ref={forwardedRef}
        className={buttonClassnames({ variant, icon }, className)}
        {...props}
      >
        {children}
      </Link>
    );
  },
);
