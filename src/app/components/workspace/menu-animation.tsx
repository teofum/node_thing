import { LuPause, LuPlay, LuRepeat, LuRewind, LuSquare } from "react-icons/lu";

import { useAnimationStore } from "@/store/animation.store";
import { Button, ToggleButton } from "@/ui/button";
import { NumberDrag } from "@/ui/number-drag";
import { ToggleGroup, ToggleItem } from "@/ui/toggle-group";
import { VideoExport } from "./video-export";

export function MenuAnimation() {
  const animation = useAnimationStore();

  return (
    <div className="flex flex-col h-full border-t border-white/15">
      <div className="flex flex-col overflow-auto min-h-0">
        <div className="flex flex-col p-3 gap-3 border-b border-white/15">
          <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
            <div className="text-xs/3 font-semibold text-white/60 ml-1">
              Seconds
            </div>
            <div className="text-xs/3 font-semibold text-white/60 ml-1">
              Frames
            </div>
            <div className="rounded-lg border border-white/15 p-2 px-3 text-sm/4 font-semibold tabular-nums text-end">
              {(animation.time / 1000).toFixed(3)}
            </div>
            <div className="rounded-lg border border-white/15 p-2 px-3 text-sm/4 font-semibold tabular-nums text-end">
              {animation.frameIndex}
            </div>
          </div>

          <div className="flex flex-row justify-center gap-2">
            <Button
              icon
              size="lg"
              variant="outline"
              onClick={animation.toggleState}
            >
              {animation.state === "running" ? <LuPause /> : <LuPlay />}
            </Button>
            <Button icon size="lg" variant="outline" onClick={animation.stop}>
              <LuSquare />
            </Button>
            <Button icon size="lg" variant="outline" onClick={animation.reset}>
              <LuRewind />
            </Button>
          </div>
        </div>

        <div className="flex flex-col p-3 gap-3 border-b border-white/15 grow">
          <div className="flex flex-col gap-1.5">
            <div className="text-xs/3 font-semibold text-white/60 ml-1">
              Duration
            </div>
            <div className="flex flex-row gap-2">
              <NumberDrag
                value={animation.options.duration}
                onChange={(duration) => animation.setOptions({ duration })}
                min={0.5}
                className="grow"
              />
              <ToggleButton
                pressed={animation.options.repeat}
                onPressedChange={(repeat) => animation.setOptions({ repeat })}
                icon
                variant="outline"
              >
                <LuRepeat />
              </ToggleButton>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="text-xs/3 font-semibold text-white/60 ml-1">
              Animation speed
            </div>
            <NumberDrag
              value={animation.options.speed}
              onChange={(speed) => animation.setOptions({ speed })}
              min={0.1}
              max={3}
              className="w-full"
              progress
            />
            <ToggleGroup
              type="single"
              value={animation.options.speed.toString()}
              onValueChange={(val) => {
                if (val) animation.setOptions({ speed: Number(val) });
              }}
            >
              <ToggleItem icon className="grow" variant="outline" value="0.25">
                0.25x
              </ToggleItem>
              <ToggleItem icon className="grow" variant="outline" value="0.5">
                0.5x
              </ToggleItem>
              <ToggleItem icon className="grow" variant="outline" value="1">
                1x
              </ToggleItem>
              <ToggleItem icon className="grow" variant="outline" value="2">
                2x
              </ToggleItem>
            </ToggleGroup>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="text-xs/3 font-semibold text-white/60 ml-1">
              Framerate limit
            </div>
            <ToggleGroup
              type="single"
              value={animation.options.framerateLimit.toString()}
              onValueChange={(val) => {
                if (val) animation.setOptions({ framerateLimit: Number(val) });
              }}
            >
              <ToggleItem icon className="grow" variant="outline" value="30">
                30
              </ToggleItem>
              <ToggleItem icon className="grow" variant="outline" value="60">
                60
              </ToggleItem>
              <ToggleItem icon className="grow" variant="outline" value="120">
                120
              </ToggleItem>
              <ToggleItem icon className="grow" variant="outline" value="10000">
                Off
              </ToggleItem>
            </ToggleGroup>
          </div>
        </div>

        <div className="flex flex-col gap-2 p-2">
          <VideoExport trigger={<Button variant="outline">Export</Button>} />
        </div>
      </div>
    </div>
  );
}
