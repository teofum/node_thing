import { create } from "zustand";
import { combine } from "zustand/middleware";

/*
 * Utility store
 * For storing things that are useful to have globally (and managed by zustand)
 * but we don't actually want persisted. We're basically using zustand as a fancy
 * useContext here.
 */

type RenderFinishedCallback = (canvas: HTMLCanvasElement) => void;
type UtilityState = {
  canvas: HTMLCanvasElement | null;
  nextRenderFinishedCallback: RenderFinishedCallback | null;
};

const initialState: UtilityState = {
  canvas: null,
  nextRenderFinishedCallback: null,
};

export const useUtilityStore = create(
  combine(initialState, (set) => ({
    setCanvas: (canvas: HTMLCanvasElement | null) => set({ canvas }),
    onNextRenderFinished: (callback: RenderFinishedCallback | null) =>
      set({ nextRenderFinishedCallback: callback }),
  })),
);
