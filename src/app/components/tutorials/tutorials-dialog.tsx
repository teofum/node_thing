import { ComponentProps } from "react";

import { Dialog, DialogClose } from "@/ui/dialog";
import { useTutorialStore } from "@/store/tutorial.store";
import { intro } from "./content/intro";
import { layerIntro } from "./content/layers";
import { Button } from "@/ui/button";
import { LuArrowRight } from "react-icons/lu";

const tutorials = [intro, layerIntro];

type ExportOptionsProps = {
  open: ComponentProps<typeof Dialog>["open"];
  onOpenChange: ComponentProps<typeof Dialog>["onOpenChange"];
};

export function TutorialsDialog({ open, onOpenChange }: ExportOptionsProps) {
  const start = useTutorialStore((s) => s.startTutorial);

  // TODO
  const description = "test description";
  const progress = 3;

  return (
    <Dialog
      title="Tutorials"
      description="Learn more about node_thing"
      trigger={null}
      open={open}
      onOpenChange={onOpenChange}
    >
      <div className="flex flex-col p-3 gap-2">
        {tutorials.map((tutorial) => (
          <DialogClose asChild key={tutorial.id}>
            <Button
              variant="outline"
              size="lg"
              className="flex justify-between!"
              onClick={() => start(tutorial)}
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  {tutorial.name}

                  <span className="text-xs text-white/60 text-left">
                    {`(${progress}/?)`}
                  </span>
                </div>

                <p className="text-xs text-white/60 text-left">{description}</p>
              </div>

              <LuArrowRight />
            </Button>
          </DialogClose>
        ))}
      </div>
    </Dialog>
  );
}
