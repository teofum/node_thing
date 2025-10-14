import {
  MkvOutputFormat,
  MovOutputFormat,
  Mp4OutputFormat,
  OutputFormat,
  WebMOutputFormat,
} from "mediabunny";

import { openFileForWriting } from "./file";

export const VIDEO_FORMATS = {
  mp4: { name: "MP4 video", get: () => new Mp4OutputFormat() },
  mov: { name: "QuickTime movie", get: () => new MovOutputFormat() },
  mkv: { name: "MKV video", get: () => new MkvOutputFormat() },
  webm: { name: "WebM video", get: () => new WebMOutputFormat() },
} satisfies Record<string, { name: string; get: () => OutputFormat }>;
export type VideoFormat = keyof typeof VIDEO_FORMATS;

export async function openVideoFileForWriting(format: OutputFormat) {
  return await openFileForWriting({
    suggestedName: `recording-${new Date().toISOString()}${format.fileExtension}`,
    types: [
      {
        description: "MP4 video file",
        accept: {
          [format.mimeType]: [format.fileExtension],
        } as FilePickerAcceptType["accept"],
      },
    ],
  });
}
