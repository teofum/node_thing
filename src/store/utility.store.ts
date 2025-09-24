import { create } from "zustand";

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

type UtilityActions = {
  setCanvas: (canvas: HTMLCanvasElement | null) => void;
  onNextRenderFinished: (callback: RenderFinishedCallback | null) => void;
};

export const useUtilityStore = create<UtilityState & UtilityActions>((set) => ({
  /*
   * State
   */
  canvas: null,
  nextRenderFinishedCallback: null,

  /*
   * Actions
   */
  setCanvas: (canvas) => set({ canvas }),
  onNextRenderFinished: (callback) =>
    set({ nextRenderFinishedCallback: callback }),
}));
