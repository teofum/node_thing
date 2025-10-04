"use client";
import React, { useState } from "react";
import * as Slider from "@radix-ui/react-slider";
import { Input } from "@/ui/input";
import cn from "classnames";

type RangeSliderProps = {
  min: number;
  max: number;
  step?: number;
  defaultMin?: number;
  defaultMax?: number;
  nameMin: string;
  nameMax: string;
  className?: string;
};

export const RangeSliderInput = React.forwardRef<
  HTMLDivElement,
  RangeSliderProps
>(
  (
    {
      min,
      max,
      step = 0.1,
      defaultMin,
      defaultMax,
      nameMin,
      nameMax,
      className,
    },
    ref,
  ) => {
    const [values, setValues] = useState<[number, number]>([
      defaultMin ?? min,
      defaultMax ?? max,
    ]);

    const [inputTexts, setInputTexts] = useState<[string, string]>([
      (defaultMin ?? min).toString(),
      (defaultMax ?? max).toString(),
    ]);

    const handleInputChange = (index: 0 | 1, text: string) => {
      setInputTexts((prev) => {
        const copy = [...prev] as [string, string];
        copy[index] = text;
        return copy;
      });
    };

    const handleInputBlur = (index: 0 | 1) => {
      let num = parseFloat(inputTexts[index]);
      if (isNaN(num)) num = index === 0 ? min : max;

      const newValues: [number, number] = [...values] as [number, number];
      newValues[index] = Math.min(Math.max(num, min), max);
      if (index === 0 && newValues[0] > newValues[1])
        newValues[0] = newValues[1];
      if (index === 1 && newValues[1] < newValues[0])
        newValues[1] = newValues[0];
      setValues(newValues);
      setInputTexts([newValues[0].toFixed(0), newValues[1].toFixed(0)]);
    };

    return (
      <div
        ref={ref}
        className={cn("flex items-center gap-2 nodrag", className)}
      >
        <div className="relative w-20">
          <Input
            type="number"
            name={nameMin}
            step={step}
            min={min}
            max={max}
            value={inputTexts[0]}
            className="w-21 text-xs pr-4"
            onChange={(e) => handleInputChange(0, e.target.value)}
            onBlur={() => handleInputBlur(0)}
          />
          <span className="absolute right-1 top-1/2 -translate-y-1/2 text-xs text-gray-400">
            $
          </span>
        </div>

        <Slider.Root
          className={cn("relative flex items-center w-full h-10", className)}
          min={min}
          max={max}
          step={step}
          value={values}
          onValueChange={(newValues: number[]) => {
            setValues([newValues[0], newValues[1]] as [number, number]);
            setInputTexts([newValues[0].toFixed(0), newValues[1].toFixed(0)]);
          }}
        >
          <Slider.Track className="relative h-[3px] grow rounded-full bg-neutral-800">
            <Slider.Range className="absolute h-full rounded-full bg-white" />
          </Slider.Track>
          <Slider.Thumb className="block size-3 rounded-[10px] bg-white shadow-[0_0_5px] shadow-white/75 hover:bg-teal-100 focus:shadow-[0_0_0_2px] focus:shadow-teal-400 focus:outline-none transition duration-150" />
          <Slider.Thumb className="block size-3 rounded-[10px] bg-white shadow-[0_0_5px] shadow-white/75 hover:bg-teal-100 focus:shadow-[0_0_0_2px] focus:shadow-teal-400 focus:outline-none transition duration-150" />
        </Slider.Root>

        <div className="relative w-20">
          <Input
            type="number"
            name={nameMax}
            value={inputTexts[1]}
            min={min}
            max={max}
            step={step}
            className="w-21 text-xs pr-4"
            onChange={(e) => handleInputChange(1, e.target.value)}
            onBlur={() => handleInputBlur(1)}
          />
          <span className="absolute right-1 top-1/2 -translate-y-1/2 text-xs text-gray-400">
            $
          </span>
        </div>
      </div>
    );
  },
);

RangeSliderInput.displayName = "RangeSliderInput";
