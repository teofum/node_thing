import { ReactNode } from "react";
import { create } from "zustand";
import { combine } from "zustand/middleware";
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
  steps: TutorialStep[];
};

type TutorialState = {
  tutorial: Tutorial | null;
  unsubscribe: (() => void) | null;
  step: number;
};

const initialState: TutorialState = {
  tutorial: null,
  unsubscribe: null,
  step: 0,
};

export const useTutorialStore = create(
  combine(initialState, (set, get) => ({
    startTutorial: (tutorial: Tutorial) => {
      const unsubscribe = useProjectStore.subscribe((state) => {
        const { tutorial, step } = get();
        if (tutorial?.steps[step].nextCondition?.(state)) {
          if (step === tutorial.steps.length - 1) {
            set({ tutorial: null, step: 0 });
          } else {
            const nextStep = tutorial.steps[step + 1];
            set({ step: step + 1 });
            nextStep.onStart?.();
          }
        }
      });

      set({
        tutorial,
        step: 0,
        unsubscribe,
      });
      tutorial.steps[0].onStart?.();
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
        set({ tutorial: null, step: 0 });
      } else {
        const nextStep = tutorial.steps[step + 1];
        set({ step: step + 1 });
        nextStep.onStart?.();
      }
    },
  })),
);
