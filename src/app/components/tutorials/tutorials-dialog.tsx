import { ComponentProps } from "react";

import { Dialog, DialogClose } from "@/ui/dialog";
import { useTutorialStore } from "@/store/tutorial.store";
import { intro } from "./content/intro";
import { Button } from "@/ui/button";
import { LuArrowRight } from "react-icons/lu";

const tutorials = [intro];

type ExportOptionsProps = {
  open: ComponentProps<typeof Dialog>["open"];
  onOpenChange: ComponentProps<typeof Dialog>["onOpenChange"];
};

export function TutorialsDialog({ open, onOpenChange }: ExportOptionsProps) {
  const start = useTutorialStore((s) => s.startTutorial);

  return (
    <Dialog
      title="Tutorials"
      description="Learn more about node thing"
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
              className="justify-between!"
              onClick={() => start(tutorial)}
            >
              {tutorial.name} <LuArrowRight />
            </Button>
          </DialogClose>
        ))}
      </div>
    </Dialog>
  );
}
