import { useMainStore } from "@/store/main.store";
import { Button } from "@/ui/button";
import { Slider } from "@/ui/slider";
import { LuPause, LuPlay, LuSquare, LuRewind } from "react-icons/lu";

export function Timeline() {
  const animation = useMainStore((s) => s.properties.animation);
  const toggleAnimationState = useMainStore((s) => s.toggleAnimationState);
  const resetAnimationTimer = useMainStore((s) => s.resetAnimationTimer);
  const scrubAnimation = useMainStore((s) => s.scrubAnimation);

  const stop = () => {
    toggleAnimationState("stopped");
    resetAnimationTimer();
  };

  return (
    <div className="glass glass-border rounded-xl absolute bottom-1 left-1 right-1 p-3 flex flex-row gap-1.5 items-center">
      <Button icon variant="outline" onClick={() => toggleAnimationState()}>
        {animation.state === "running" ? <LuPause /> : <LuPlay />}
      </Button>
      <Button icon variant="outline" onClick={stop}>
        <LuSquare />
      </Button>
      <Button icon variant="outline" onClick={resetAnimationTimer}>
        <LuRewind />
      </Button>
      <div className="grow ml-1.5">
        <Slider
          withInput
          className="w-full"
          value={animation.time / 1000}
          max={animation.duration}
          onChange={(v) => scrubAnimation(v * 1000)}
          min={0}
          inputProps={{ readOnly: true, disabled: true, className: "!w-18" }}
          display={(v) =>
            `${Math.floor(v / 60).toLocaleString("en-us", { minimumIntegerDigits: 2, maximumFractionDigits: 0 })}:${(v % 60).toLocaleString("en-us", { minimumIntegerDigits: 2, maximumFractionDigits: 2, minimumFractionDigits: 2 })}`
          }
        />
      </div>
    </div>
  );
}
