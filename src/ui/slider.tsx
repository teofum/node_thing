import React, { useRef } from "react";
import * as Slider from "@radix-ui/react-slider";
import { Input } from "@/ui/input";
import cn from "classnames";

function clamp(value: number, min: number, max: number) {
  return value < min ? min : value > max ? max : value;
}

type SliderInputProps = {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
} & Omit<
  React.ComponentPropsWithoutRef<typeof Slider.Root>,
  "value" | "onChange"
>;

export const SliderInput = React.forwardRef<HTMLInputElement, SliderInputProps>(
  (
    { value, onChange, min = 0, max = 1, step = 0.01, className, ...props },
    forwardedRef,
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const updateValue = (v: string) => {
      let newVal = parseFloat(v);
      if (isNaN(newVal)) newVal = 0;
      const newStr = newVal.toString();
      if (v != newStr) {
        if (inputRef.current) inputRef.current.value = newStr;
      }
      onChange(newVal);
    };

    return (
      <div className="flex h-5 gap-1 nodrag" ref={forwardedRef}>
        <Slider.Root
          className={cn("relative flex items-center", className)}
          min={min}
          max={max}
          step={step}
          value={[value]}
          onValueChange={(values) => {
            if (inputRef.current) inputRef.current.value = values[0].toString();
            onChange(values[0]);
          }}
          {...props}
        >
          <Slider.Track className="relative h-[3px] grow rounded-full bg-neutral-800">
            <Slider.Range className="absolute h-full rounded-full bg-white" />
          </Slider.Track>
          <Slider.Thumb className="block size-3 rounded-[10px] bg-white shadow-[0_0_5px] shadow-white/75 hover:bg-teal-100 focus:shadow-[0_0_0_2px] focus:shadow-teal-400 focus:outline-none transition duration-150" />
        </Slider.Root>

        <Input
          ref={inputRef}
          variant="outline"
          size="sm"
          className="min-w-10 w-0 !text-xs"
          defaultValue={value}
          onBlur={(ev) => {
            updateValue(ev.currentTarget.value);
          }}
          onKeyDown={(ev) => {
            if (ev.key === "Enter") updateValue(ev.currentTarget.value);
          }}
        />
      </div>
    );
  },
);

SliderInput.displayName = "SliderInput";
