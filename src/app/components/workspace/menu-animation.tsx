import { useMainStore } from "@/store/main.store";
import { Button, ToggleButton } from "@/ui/button";
import { NumberDrag } from "@/ui/number-drag";
import { ToggleGroup, ToggleItem } from "@/ui/toggle-group";
import { LuPause, LuPlay, LuRepeat, LuRewind, LuSquare } from "react-icons/lu";

export function MenuAnimation() {
  const animation = useMainStore((s) => s.properties.animation);
  const toggleAnimationState = useMainStore((s) => s.toggleAnimationState);
  const resetAnimationTimer = useMainStore((s) => s.resetAnimationTimer);
  const setAnimationSpeed = useMainStore((s) => s.setAnimationSpeed);
  const setFramerateLimit = useMainStore((s) => s.setFramerateLimit);
  const setAnimationDuration = useMainStore((s) => s.setAnimationDuration);
  const setAnimationRepeat = useMainStore((s) => s.setAnimationRepeat);

  const stop = () => {
    toggleAnimationState("stopped");
    resetAnimationTimer();
  };

  return (
    <div className="flex flex-col h-full border-t border-white/15">
      <div className="flex flex-col gap-3 p-3">
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

        <div className="flex flex-row justify-center gap-2 pb-3 border-b border-white/15">
          <Button
            icon
            size="lg"
            variant="outline"
            onClick={() => toggleAnimationState()}
          >
            {animation.state === "running" ? <LuPause /> : <LuPlay />}
          </Button>
          <Button icon size="lg" variant="outline" onClick={stop}>
            <LuSquare />
          </Button>
          <Button
            icon
            size="lg"
            variant="outline"
            onClick={resetAnimationTimer}
          >
            <LuRewind />
          </Button>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="text-xs/3 font-semibold text-white/60 ml-1">
            Duration
          </div>
          <div className="flex flex-row gap-2">
            <NumberDrag
              value={animation.duration}
              onChange={setAnimationDuration}
              min={0.5}
              className="grow"
            />
            <ToggleButton
              pressed={animation.repeat}
              onPressedChange={setAnimationRepeat}
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
            value={animation.animationSpeed}
            onChange={setAnimationSpeed}
            min={0.1}
            max={3}
            className="w-full"
            progress
          />
          <ToggleGroup
            type="single"
            value={animation.animationSpeed.toString()}
            onValueChange={(val) => {
              if (val) setAnimationSpeed(Number(val));
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
            value={animation.framerateLimit.toString()}
            onValueChange={(val) => {
              if (val) setFramerateLimit(Number(val));
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
    </div>
  );
}
