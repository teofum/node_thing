import React from "react";
import * as S from "@radix-ui/react-slider";
import { Input } from "@/ui/input";
import cn from "classnames";
import { useLocalValue } from "@/utils/use-local-value";

type SliderInputProps = {
  value: number;
  onChange?: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
  withInput?: boolean;
  inputProps?: React.ComponentProps<typeof Input>;
  display?: (value: number, significantDigits: number) => string;
} & Omit<React.ComponentPropsWithoutRef<typeof S.Root>, "value" | "onChange">;

export function Slider({
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.01,
  className,
  withInput = false,
  inputProps,
  display = (v, sd) => v.toFixed(sd),
  ...props
}: SliderInputProps) {
  const { localValue, handleInputChange, handleBlur, constrainedOnChange } =
    useLocalValue(value, min, max, step, onChange, display);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault(); // prevent default to avoid any selection / flickering

      const num = parseFloat(e.currentTarget.value);
      if (!isNaN(num)) constrainedOnChange(num);
    }
  };

  return (
    <div className="flex h-5 gap-1 nodrag items-center">
      <S.Root
        className={cn("relative flex items-center", className)}
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(values) => onChange?.(values[0])}
        {...props}
      >
        <S.Track className="relative h-[3px] grow rounded-full bg-neutral-800">
          <S.Range className="absolute h-full rounded-full bg-white" />
        </S.Track>
        <S.Thumb className="block size-3 rounded-[10px] bg-white shadow-[0_0_5px] shadow-white/75 hover:bg-teal-100 focus:shadow-[0_0_0_2px] focus:shadow-teal-400 focus:outline-none transition duration-150" />
      </S.Root>

      {withInput ? (
        <Input
          variant="outline"
          size="sm"
          {...inputProps}
          className={cn("min-w-0 w-12 tabular-nums", inputProps?.className)}
          value={localValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
      ) : null}
    </div>
  );
}
