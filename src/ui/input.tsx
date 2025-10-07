import { ComponentProps, forwardRef } from "react";
import cn from "classnames";

type CustomProps = {
  size?: "sm" | "md";
  variant?: "default" | "outline";
};

type InputProps = Omit<ComponentProps<"input">, "size"> & CustomProps;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function InputImpl(
    { className, variant = "default", size = "md", ...props },
    forwardedRef,
  ) {
    return (
      <input
        ref={forwardedRef}
        className={cn(
          "rounded-lg placeholder:text-white/40",
          "outline-0 transition duration-150",
          {
            "p-1.5 text-xs/3 h-6.5": size === "sm",
            "p-3 text-sm/4": size === "md",
            "border border-white/15 focus-visible:border-teal-400 focus-visible:outline-2 outline-teal-400/30":
              variant === "outline",
            "border-b border-t border-black/30 border-b-white/10 bg-border bg-gradient-to-b from-white/2 to-white/5 focus-visible:outline outline-teal-400 focus-visible:shadow-[0_0_0_3px] shadow-teal-400/30":
              variant === "default",
          },
          className,
        )}
        {...props}
      />
    );
  },
);
