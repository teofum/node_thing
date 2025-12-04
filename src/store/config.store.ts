import { create } from "zustand";
import { combine, persist } from "zustand/middleware";

export type SidebarPanel = "library" | "layers" | "assets" | "animation";
export type DisplayOption = "final-render" | "layer-output" | "selection";

export type Config = {
  view: {
    zoom: number;
    layerHandles: boolean;
    timeline: boolean;
    sidebar: {
      panel: SidebarPanel;
      pinned: boolean;
    };
    tooltipsEnabled: boolean;
    display: DisplayOption;
  };
};

const initialState: Config = {
  view: {
    zoom: 1,
    layerHandles: false,
    timeline: false,
    sidebar: {
      panel: "library",
      pinned: false,
    },
    tooltipsEnabled: true,
    display: "final-render",
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
