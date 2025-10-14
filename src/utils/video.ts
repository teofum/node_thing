import { Mp4OutputFormat } from "mediabunny";

import { openFileForWriting } from "./file";

export async function openVideoFileForWriting(format: Mp4OutputFormat) {
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
