"use client";

import { useTutorialStore } from "@/store/tutorial.store";
import { Button } from "@/ui/button";
import { Dialog } from "@/ui/dialog";

export function Tutorial() {
  const { tutorial, step } = useTutorialStore();
  const currentStep = useTutorialStore((s) => s.tutorial?.steps[s.step]);
  const end = useTutorialStore((s) => s.endTutorial);
  const next = useTutorialStore((s) => s.nextStep);

  return (
    <Dialog
      modal={currentStep?.nextCondition === undefined}
      trigger={null}
      open={tutorial !== null}
      onOpenChange={(open) => open || end()}
      title={currentStep?.title}
      description={`${step + 1} of ${tutorial?.steps.length}`}
      onInteractOutside={(ev) => ev.preventDefault()}
      className="select-none"
      style={{
        top: currentStep?.position?.y,
        left: currentStep?.position?.x,
        translate: currentStep?.position ? "none" : undefined,
        maxWidth: currentStep?.maxWidth ?? 480,
      }}
    >
      <div className="p-3">{currentStep?.content}</div>
      {currentStep && !currentStep.nextCondition ? (
        <div className="p-3 flex flex-row gap-2 justify-end items-end border-t border-white/15">
          <Button variant="outline" onClick={next}>
            Continue
          </Button>
        </div>
      ) : null}
    </Dialog>
  );
}
