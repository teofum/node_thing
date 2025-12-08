import { saveTutorialProgress } from "./actions";
import { TutorialState } from "./tutorial.store";

export function setTutorialStep(
  get: () => TutorialState,
  set: (
    partial:
      | TutorialState
      | Partial<TutorialState>
      | ((state: TutorialState) => TutorialState | Partial<TutorialState>),
  ) => void,
  newIndex: number,
) {
  const { tutorial, progress, unsubscribe } = get();

  if (!tutorial) return;

  if (newIndex > tutorial.steps.length) {
    throw new Error("Invalid tutorial index");
  }

  const newProgress = {
    ...progress,
    [tutorial.id]: newIndex,
  };

  if (newIndex === tutorial.steps.length) {
    unsubscribe?.();
    set({
      tutorial: null,
      step: 0,
      progress: newProgress,
      unsubscribe: null,
    });

    saveTutorialProgress(newProgress);
  } else {
    const nextStep = tutorial.steps[newIndex];

    set({
      step: newIndex,
      progress: newProgress,
    });

    nextStep.onStart?.();
    saveTutorialProgress(newProgress);
  }
}
