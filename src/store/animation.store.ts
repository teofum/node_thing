import {
  QUALITY_HIGH,
  QUALITY_LOW,
  QUALITY_MEDIUM,
  QUALITY_VERY_HIGH,
  QUALITY_VERY_LOW,
  VideoCodec,
} from "mediabunny";
import { create } from "zustand";
import { combine, persist } from "zustand/middleware";

import { VIDEO_FORMATS, VideoFormat } from "@/utils/video";

export const QUALITY_SETTINGS = {
  Awful: QUALITY_VERY_LOW,
  Low: QUALITY_LOW,
  Medium: QUALITY_MEDIUM,
  High: QUALITY_HIGH,
  Max: QUALITY_VERY_HIGH,
};

export type AnimationState = "running" | "stopped" | "frame";
type Animation = {
  state: AnimationState;
  time: number;
  frameIndex: number;
  recording: boolean;

  options: {
    speed: number;
    framerateLimit: number;
    duration: number;
    repeat: boolean;
  };

  recordingOptions: {
    framerate: number;
    format: VideoFormat;
    codec: VideoCodec;
    qualityMode: "auto" | "manual";
    bitrate: number;
    quality: keyof typeof QUALITY_SETTINGS;
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
    duration: 10,
    repeat: false,
  },

  recordingOptions: {
    framerate: 60,
    format: "mp4",
    codec: "avc",
    qualityMode: "auto",
    bitrate: 10000,
    quality: "High",
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

      setRecordingOptions: (options: Partial<Animation["recordingOptions"]>) =>
        set(({ recordingOptions: oldOptions }) => {
          const newOptions = { ...oldOptions, ...options };
          const { format, codec } = newOptions;

          const currentCodecSupported = VIDEO_FORMATS[format]
            .get()
            .getSupportedVideoCodecs()
            .includes(codec);

          if (!currentCodecSupported) newOptions.codec = "vp9";
          return { recordingOptions: newOptions };
        }),

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
