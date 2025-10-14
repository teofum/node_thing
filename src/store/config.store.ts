import { create } from "zustand";
import { combine } from "zustand/middleware";

export type Config = {
  view: {
    zoom: number;
  };
};

const initialState: Config = {
  view: {
    zoom: 1,
  },
};

export const useConfigStore = create(
  combine(initialState, (set) => ({
    updateView: (view: Partial<Config["view"]>) =>
      set(({ view: oldView }) => ({
        view: {
          ...oldView,
          ...view,
        },
      })),
  })),
);
