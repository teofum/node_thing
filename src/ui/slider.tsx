import React, { useState, useEffect } from "react";
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
    const [internalValue, setInternalValue] = useState(value.toString());

    useEffect(() => {
      setInternalValue(value.toString());
    }, [value]);

    const updateValue = () => {
      let newVal = clamp(parseFloat(internalValue), min, max);
      if (isNaN(newVal)) newVal = 0;
      setInternalValue(newVal.toString());
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
            setInternalValue(values[0].toString());
            onChange(values[0]);
          }}
          {...props}
        >
          <Slider.Track className="relative h-[3px] grow rounded-full bg-neutral-800">
            <Slider.Range className="absolute h-full rounded-full bg-white" />
          </Slider.Track>
          <Slider.Thumb className="block size-3 rounded-[10px] bg-white shadow-[0_0_5px] shadow-white/75 hover:bg-neutral-300 focus:shadow-[0_0_0_2px] focus:shadow-white/25 focus:outline-none transition duration-100" />
        </Slider.Root>

        <Input
          variant="outline"
          size="sm"
          className="min-w-10 w-0 !text-xs"
          value={internalValue}
          onChange={(ev) => {
            setInternalValue(ev.target.value);
          }}
          onBlur={updateValue}
          onKeyDown={(ev) => {
            if (ev.key === "Enter") updateValue();
          }}
        />
      </div>
    );
  },
);

SliderInput.displayName = "SliderInput";
