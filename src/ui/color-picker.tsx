import React, { useState } from "react";
import {
  ColorPicker,
  ColorArea,
  ColorThumb,
  ColorSwatch,
  ColorSlider,
  SliderTrack,
  ColorField,
  Color,
  ColorFieldRenderProps,
} from "react-aria-components";
import { DialogTrigger, Dialog, Popover, Button } from "react-aria-components";
import { Input } from "@/ui/input";
import cn from "classnames";

type ColorInputProps = {
  defaultColor?: string;
  onChange?: (color: string) => void;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "onChange">;

export const ColorInput = React.forwardRef<HTMLInputElement, ColorInputProps>(
  (
    { defaultColor = "#000000", onChange, className, ...props },
    forwardedRef,
  ) => {
    const [color, setColor] = useState(defaultColor);

    const changeColor = (v: Color) => {
      const colorStr = v.toString("hex");
      setColor(colorStr);
      if (onChange) onChange(colorStr);
    };

    return (
      <div
        ref={forwardedRef}
        className={cn("flex gap-2 items-center", className)}
        {...props}
      >
        <ColorPicker
          defaultValue={defaultColor}
          value={color}
          onChange={changeColor}
        >
          <DialogTrigger>
            <Button className="flex items-center gap-2 px-0 py-0 bg-transparent border-0 rounded-md text-base text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-400">
              <ColorSwatch color={color} className="w-5 h-5 rounded-sm" />
            </Button>
            <Popover
              className={cn(
                "rounded-lg text-black",
                "shadow-black shadow-[0_0_40px] w-auto",
                "transform transition-transform duration-200 ease-out",
                "data-[entering]:opacity-0 data-[entering]:scale-90",
                "data-[exiting]:opacity-0 data-[exiting]:scale-90",
              )}
            >
              <Dialog className="flex flex-col gap-4 p-4 min-w-48 box-border rounded-md glass glass-border focus-visible:outline-none">
                <ColorArea
                  className="w-48 h-48 rounded-md flex-shrink-0 relative"
                  colorSpace="hsb"
                  xChannel="saturation"
                  yChannel="brightness"
                >
                  <ColorThumb className="w-5 h-5 rounded-full border-2 border-white shadow-[0_0_0_1px_black,inset_0_0_0_1px_black] box-border absolute" />
                </ColorArea>

                <ColorSlider
                  colorSpace="hsb"
                  channel="hue"
                  className="grid w-full gap-1"
                >
                  <SliderTrack className="relative rounded-md h-7">
                    <ColorThumb className="top-1/2 w-5 h-5 rounded-full border-2 border-white shadow-[0_0_0_1px_black,inset_0_0_0_1px_black] box-border" />
                  </SliderTrack>
                </ColorSlider>

                <ColorField>
                  {(
                    props: ColorFieldRenderProps & {
                      defaultChildren?: React.ReactNode;
                    },
                  ) => {
                    const {
                      isDisabled,
                      isInvalid,
                      defaultChildren,
                      ...inputProps
                    } = props;
                    void isInvalid;
                    void defaultChildren;
                    const commitChange = () => {
                      inputProps.state.commit();
                    };

                    return (
                      <Input
                        {...inputProps}
                        className="h-7 w-22 text-white"
                        onChange={(ev) => {
                          inputProps.state.setInputValue(
                            ev.currentTarget.value,
                          );
                        }}
                        onBlur={commitChange}
                        onKeyDown={(ev) => {
                          if (ev.key === "Enter") commitChange();
                        }}
                        value={inputProps.state.inputValue}
                        disabled={isDisabled}
                      />
                    );
                  }}
                </ColorField>
              </Dialog>
            </Popover>
          </DialogTrigger>
        </ColorPicker>
      </div>
    );
  },
);
ColorInput.displayName = "ColorInput";
