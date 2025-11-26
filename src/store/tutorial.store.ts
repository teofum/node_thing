import { ReactNode } from "react";
import { create } from "zustand";
import { combine, persist } from "zustand/middleware";
import { useProjectStore } from "./project.store";
import { Project } from "./project.types";
import { Point } from "@/utils/point";

export type TutorialStep = {
  title: string;
  content: ReactNode;
  onStart?: () => void;
  nextCondition?: (state: Project) => boolean;
  position?: Point;
  maxWidth?: number;
};

export type Tutorial = {
  id: string;
  name: string;
  description: string;
  steps: TutorialStep[];
};

type TutorialState = {
  tutorial: Tutorial | null;
  unsubscribe: (() => void) | null;
  step: number;
  progress: Record<string, number>;
};

const initialState: TutorialState = {
  tutorial: null,
  unsubscribe: null,
  step: 0,
  progress: {},
};

export const useTutorialStore = create(
  persist(
    combine(initialState, (set, get) => ({
      startTutorial: (tutorial: Tutorial) => {
        const unsubscribe = useProjectStore.subscribe((state) => {
          const { tutorial, step } = get();
          if (tutorial?.steps[step].nextCondition?.(state)) {
            if (step === tutorial.steps.length - 1) {
              set((s) => ({
                tutorial: null,
                step: 0,
                progress: {
                  ...s.progress,
                  [tutorial.id]: tutorial.steps.length,
                },
              }));
            } else {
              const nextStep = tutorial.steps[step + 1];
              set({ step: step + 1 });
              nextStep.onStart?.();
            }
          }
        });

        const progressStep = get().progress[tutorial.id] ?? 0;

        set({
          tutorial,
          step: progressStep,
          unsubscribe,
        });
        tutorial.steps[progressStep].onStart?.();
      },

      endTutorial: () => {
        const { unsubscribe } = get();
        unsubscribe?.();
        set(initialState);
      },

      nextStep: () => {
        const { step, tutorial } = get();
        if (!tutorial) return;

        if (step === tutorial.steps.length - 1) {
          set((s) => ({
            tutorial: null,
            step: 0,
            progress: { ...s.progress, [tutorial.id]: tutorial.steps.length },
          }));
        } else {
          const nextStep = tutorial.steps[step + 1];
          set((s) => ({
            step: step + 1,
            progress: { ...s.progress, [tutorial.id]: step + 1 },
          }));
          nextStep.onStart?.();
        }
      },
    })),
    {
      name: "tutorial-store",

      partialize: (state) => ({
        progress: state.progress,
      }),
    },
  ),
);
