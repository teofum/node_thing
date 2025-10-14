import { create } from "zustand";
import { combine, persist } from "zustand/middleware";

export type Config = {
  view: {
    zoom: number;
    layerHandles: boolean;
    timeline: boolean;
  };
};

const initialState: Config = {
  view: {
    zoom: 1,
    layerHandles: false,
    timeline: false,
  },
};

export const useConfigStore = create(
  persist(
    combine(initialState, (set) => ({
      updateView: (view: Partial<Config["view"]>) =>
        set(({ view: oldView }) => ({
          view: {
            ...oldView,
            ...view,
          },
        })),
    })),
    { name: "config-store" },
  ),
);
