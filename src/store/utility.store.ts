import { create } from "zustand";
import { combine } from "zustand/middleware";
import {
  CanvasSource,
  Output,
  OutputOptions,
  VideoEncodingConfig,
} from "mediabunny";

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

  recorder: {
    output: Output;
    source: CanvasSource;
    onRecordingFinished: () => Promise<void>;
  } | null;
};

const initialState: UtilityState = {
  canvas: null,
  nextRenderFinishedCallback: null,

  recorder: null,
};

export const useUtilityStore = create(
  combine(initialState, (set, get) => ({
    setCanvas: (canvas: HTMLCanvasElement | null) => set({ canvas }),

    onNextRenderFinished: (callback: RenderFinishedCallback | null) =>
      set({ nextRenderFinishedCallback: callback }),

    createRecorder: async (
      outputOptions: OutputOptions,
      encodingOptions: VideoEncodingConfig,
      finishedCallback?: () => void,
    ) => {
      const { recorder, canvas } = get();
      if (recorder) throw new Error("recorder already exists!");
      if (!canvas) throw new Error("canvas is null!");

      const output = new Output(outputOptions);
      const source = new CanvasSource(canvas, encodingOptions);
      output.addVideoTrack(source);

      output.setMetadataTags({
        title: "recording",
        artist: "node-thing",
      });

      await output.start();

      const onRecordingFinished = async () => {
        await output.finalize();
        finishedCallback?.();
        set({ recorder: null });
      };

      set({
        recorder: { output, source, onRecordingFinished },
      });
    },
  })),
);
