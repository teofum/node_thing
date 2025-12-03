import { ReactNode } from "react";
import { create } from "zustand";
import { combine, persist } from "zustand/middleware";
import { useProjectStore } from "./project.store";
import { Project } from "./project.types";
import { Point } from "@/utils/point";
import { saveTutorialProgress } from "./actions";
import { setTutorialStep } from "./tutorial.actions";

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

export type TutorialState = {
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
            setTutorialStep(get, set, step + 1);
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
        const { step } = get();
        setTutorialStep(get, set, step + 1);
      },

      syncProgress: (remote: Record<string, number>) => {
        const local = get().progress;

        const merged: Record<string, number> = { ...local };

        for (const key in remote) {
          merged[key] = Math.max(remote[key] ?? 0, local[key] ?? 0);
        }

        set({ progress: merged });
      },

      resetProgress: (tutorialId: string) => {
        const { progress } = get();

        const newProgress = {
          ...progress,
          [tutorialId]: 0,
        };

        set({ progress: newProgress });
        saveTutorialProgress(newProgress);
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
