import { create } from "zustand";
import { combine, persist } from "zustand/middleware";

export type AnimationState = "running" | "stopped" | "frame";
type Animation = {
  state: AnimationState;
  time: number;
  frameIndex: number;

  options: {
    speed: number;
    framerateLimit: number;
    duration: number;
    repeat: boolean;
  };
};

const initialState: Animation = {
  state: "stopped",
  time: 0,
  frameIndex: 0,

  options: {
    speed: 1,
    framerateLimit: 30,
    duration: 10,
    repeat: false,
  },
};

export const useAnimationStore = create(
  persist(
    combine(initialState, (set) => ({
      setState: (state: AnimationState) => set({ state }),
      toggleState: () =>
        set(({ state: oldState }) => ({
          state: oldState === "stopped" ? "running" : "stopped",
        })),

      stop: () => set({ time: 0, frameIndex: 0, state: "stopped" }),
      reset: () =>
        set(({ state: oldState }) => ({
          time: 0,
          frameIndex: 0,
          state: oldState === "running" ? "running" : "frame",
        })),

      update: (frametime: number) =>
        set(({ time, frameIndex, options }) => {
          time = time + frametime;
          frameIndex = frameIndex + 1;

          if (options.repeat && time > options.duration * 1000) {
            time = 0;
            frameIndex = 0;
          }

          return { time, frameIndex };
        }),

      scrub: (time: number) => set({ time, frameIndex: 0, state: "frame" }),

      setOptions: (options: Partial<Animation["options"]>) =>
        set(({ options: oldOptions }) => ({
          options: { ...oldOptions, ...options },
        })),
    })),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    { name: "animation-store", partialize: ({ state, ...rest }) => rest },
  ),
);
