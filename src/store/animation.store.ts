import { create } from "zustand";
import { combine, persist } from "zustand/middleware";

export type AnimationState = "running" | "stopped" | "frame";
type Animation = {
  state: AnimationState;
  time: number;
  frameIndex: number;
  recording: boolean;

  options: {
    speed: number;
    framerateLimit: number;
    recordingFramerate: number;
    duration: number;
    repeat: boolean;
  };
};

const initialState: Animation = {
  state: "stopped",
  time: 0,
  frameIndex: 0,
  recording: false,

  options: {
    speed: 1,
    framerateLimit: 30,
    recordingFramerate: 60,
    duration: 10,
    repeat: false,
  },
};

export const useAnimationStore = create(
  persist(
    combine(initialState, (set, get) => ({
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

      update: (frametime: number) => {
        let { time, frameIndex, recording, state } = get();
        const { options } = get();

        time = time + frametime;
        frameIndex = frameIndex + 1;

        const pastEnd = time > options.duration * 1000;
        if (pastEnd) {
          if (options.repeat) {
            time = 0;
            frameIndex = 0;
          }

          if (recording) {
            recording = false;
            state = "stopped";
          }
        }

        set({ time, frameIndex, recording, state });

        return pastEnd;
      },

      scrub: (time: number) => set({ time, frameIndex: 0, state: "frame" }),

      setOptions: (options: Partial<Animation["options"]>) =>
        set(({ options: oldOptions }) => ({
          options: { ...oldOptions, ...options },
        })),

      startRecording: () =>
        set({
          time: 0,
          frameIndex: 0,
          state: "running",
          recording: true,
        }),
    })),
    {
      name: "animation-store",
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      partialize: ({ state, recording, ...rest }) => rest,
    },
  ),
);
