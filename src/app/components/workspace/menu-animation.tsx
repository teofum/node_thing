import { useMainStore } from "@/store/main.store";
import { Button } from "@/ui/button";
import { NumberDrag } from "@/ui/number-drag";
import { SliderInput } from "@/ui/slider";
import { ToggleGroup, ToggleItem } from "@/ui/toggle-group";
import { LuPause, LuPlay, LuRewind, LuSquare } from "react-icons/lu";

export function MenuAnimation() {
  const animation = useMainStore((s) => s.properties.animation);
  const toggleAnimationState = useMainStore((s) => s.toggleAnimationState);
  const resetAnimationTimer = useMainStore((s) => s.resetAnimationTimer);
  const setAnimationSpeed = useMainStore((s) => s.setAnimationSpeed);
  const setFramerateLimit = useMainStore((s) => s.setFramerateLimit);

  const stop = () => {
    toggleAnimationState("stopped");
    resetAnimationTimer();
  };

  return (
    <div className="flex flex-col h-full border-t border-white/15">
      <div className="flex flex-col gap-2 p-2">
        <div className="flex flex-row justify-center gap-2 pb-2 border-b border-white/15">
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

        <div className="grid grid-cols-2 gap-x-2 gap-y-1">
          <div className="text-xs/3 font-semibold text-white/60 ml-1">
            Seconds
          </div>
          <div className="text-xs/3 font-semibold text-white/60 ml-1">
            Frames
          </div>
          <div className="rounded-lg border border-white/15 p-2 px-3 text-sm/4 font-semibold tabular-nums">
            {(animation.time / 1000).toFixed(3)}
          </div>
          <div className="rounded-lg border border-white/15 p-2 px-3 text-sm/4 font-semibold tabular-nums">
            {animation.frameIndex}
          </div>
        </div>

        <div className="text-xs/3 font-semibold text-white/60 ml-1">
          Animation speed
        </div>
        <NumberDrag
          value={animation.animationSpeed}
          onChange={setAnimationSpeed}
          min={0.1}
          max={3}
          step={0.01}
          display={(v) => `${(v * 100).toFixed(0)}%`}
          progress
          className="w-full"
        />

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
  );
}
