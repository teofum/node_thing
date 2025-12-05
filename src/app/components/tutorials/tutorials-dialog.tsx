import { ComponentProps } from "react";

import { Dialog, DialogClose } from "@/ui/dialog";
import { useTutorialStore } from "@/store/tutorial.store";
import { intro } from "./content/intro";
import { layerIntro } from "./content/layers";
import { animationIntro } from "./content/animation";
import { Button } from "@/ui/button";
import { LuArrowRight, LuUndo2 } from "react-icons/lu";

const tutorials = [intro, layerIntro, animationIntro];

type ExportOptionsProps = {
  open: ComponentProps<typeof Dialog>["open"];
  onOpenChange: ComponentProps<typeof Dialog>["onOpenChange"];
};

export function TutorialsDialog({ open, onOpenChange }: ExportOptionsProps) {
  const start = useTutorialStore((s) => s.startTutorial);
  const progress = useTutorialStore((s) => s.progress);
  const reset = useTutorialStore((s) => s.resetProgress);

  return (
    <Dialog
      title="Tutorials"
      description="Learn more about node_thing"
      trigger={null}
      open={open}
      onOpenChange={onOpenChange}
      className="w-2/5"
    >
      <div className="flex flex-col p-3 gap-1">
        {tutorials.map((tutorial) => (
          <div
            key={tutorial.id}
            className="flex items-center min-h-0 min-w-0 justify-between mb-3 border border-white/15 rounded-md p-3 hover:bg-current/10 disabled:bg-current/10 active:bg-current/15 disabled:active:bg-current/10"
          >
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <div className="font-semibold">{tutorial.name}</div>

                <span className="text-xs text-white/60 text-left">
                  {`(${progress[tutorial.id] ? progress[tutorial.id] + 1 : 0}/${tutorial.steps.length})`}
                </span>
              </div>

              <p className="text-xs text-white/60 text-left">
                {tutorial.description}
              </p>
            </div>

            <div className="flex gap-1">
              <Button
                icon
                variant="ghost"
                className="text-red-400"
                onClick={() => reset(tutorial.id)}
              >
                <LuUndo2 />
              </Button>

              <DialogClose asChild>
                <Button icon variant="ghost" onClick={() => start(tutorial)}>
                  <LuArrowRight />
                </Button>
              </DialogClose>
            </div>
          </div>
        ))}
      </div>
    </Dialog>
  );
}
