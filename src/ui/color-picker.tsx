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
  DialogTrigger,
  Dialog,
  Popover,
  Button,
} from "react-aria-components";
import cn from "classnames";

import { Input } from "@/ui/input";

type ColorInputProps = {
  defaultColor?: number[];
  onChange?: (color: number[]) => void;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "onChange">;

export const ColorInput = React.forwardRef<HTMLInputElement, ColorInputProps>(
  (
    { defaultColor = [0, 0, 1, 1], onChange, className, ...props },
    forwardedRef,
  ) => {
    const rgbaColor = defaultColor.map((val) => Math.round(val * 255));
    const [color, setColor] = useState(`rgba(${rgbaColor.toString()})`);

    const changeColor = (c: Color) => {
      const colorStr = c.toString("rgba");
      setColor(colorStr);

      const colorRgb = c.toFormat("rgba");
      const rgb = colorRgb
        .getColorChannels()
        .map((ch) => colorRgb.getChannelValue(ch) / 255);
      if (onChange) onChange(rgb);
    };

    return (
      <div
        ref={forwardedRef}
        className={cn("flex gap-2 items-center", className)}
        {...props}
      >
        <ColorPicker value={color} onChange={changeColor}>
          <DialogTrigger>
            <Button className="flex w-full items-center gap-2 px-0 py-0 bg-transparent border-0 rounded-lg text-base text-white focus-visible:outline-2 focus-visible:outline-teal-400">
              <ColorSwatch color={color} className="w-full h-5 rounded-lg" />
            </Button>
            <Popover
              className={cn(
                "w-auto",
                "transform transition-transform duration-200 ease-out",
                "data-[entering]:opacity-0 data-[entering]:scale-90",
                "data-[exiting]:opacity-0 data-[exiting]:scale-90",
              )}
            >
              <Dialog className="flex flex-col gap-4 p-4 min-w-48 box-border rounded-xl glass glass-border focus-visible:outline-none">
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
                        variant="outline"
                        size="sm"
                        className="w-full"
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
