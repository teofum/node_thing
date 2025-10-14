import { LuPause, LuPlay, LuSquare, LuRewind } from "react-icons/lu";

import { useAnimationStore } from "@/store/animation.store";
import { Button } from "@/ui/button";
import { Slider } from "@/ui/slider";

export function Timeline() {
  const animation = useAnimationStore();

  return (
    <div className="glass glass-border rounded-xl absolute bottom-1 left-1 right-1 p-3 flex flex-row gap-1.5 items-center">
      <Button icon variant="outline" onClick={animation.toggleState}>
        {animation.state === "running" ? <LuPause /> : <LuPlay />}
      </Button>
      <Button icon variant="outline" onClick={animation.stop}>
        <LuSquare />
      </Button>
      <Button icon variant="outline" onClick={animation.reset}>
        <LuRewind />
      </Button>
      <div className="grow ml-1.5">
        <Slider
          withInput
          className="w-full"
          value={animation.time / 1000}
          max={animation.options.duration}
          onChange={(v) => animation.scrub(v * 1000)}
          min={0}
          inputProps={{
            readOnly: true,
            disabled: true,
            className: "!min-w-16.5 text-center",
          }}
          display={(v) =>
            `${Math.floor(v / 60).toLocaleString("en-us", { minimumIntegerDigits: 2, maximumFractionDigits: 0 })}:${(v % 60).toLocaleString("en-us", { minimumIntegerDigits: 2, maximumFractionDigits: 2, minimumFractionDigits: 2 })}`
          }
        />
      </div>
    </div>
  );
}
