import * as C from "@radix-ui/react-collapsible";
import { StreamTarget, VideoCodec } from "mediabunny";
import { ComponentProps, useState } from "react";
import { LuChevronDown, LuCircle, LuCircleCheckBig } from "react-icons/lu";

import { QUALITY_SETTINGS, useAnimationStore } from "@/store/animation.store";
import { useUtilityStore } from "@/store/utility.store";
import { Button } from "@/ui/button";
import { Dialog } from "@/ui/dialog";
import { NumberDrag } from "@/ui/number-drag";
import { Select, SelectItem } from "@/ui/select";
import { ToggleGroup, ToggleItem } from "@/ui/toggle-group";
import {
  openVideoFileForWriting,
  VIDEO_FORMATS,
  VideoFormat,
} from "@/utils/video";

type VideoExportProps = {
  trigger: ComponentProps<typeof Dialog>["trigger"];
  open?: ComponentProps<typeof Dialog>["open"];
  onOpenChange?: ComponentProps<typeof Dialog>["onOpenChange"];
};

export function VideoExport({ trigger, open, onOpenChange }: VideoExportProps) {
  const animation = useAnimationStore();
  const { recordingOptions: opts } = animation;

  const createRecorder = useUtilityStore((s) => s.createRecorder);

  const [recordingDone, setRecordingDone] = useState(false);

  const record = async () => {
    const format = VIDEO_FORMATS[opts.format].get();

    const writable = await openVideoFileForWriting(format);
    if (!writable) return;

    await createRecorder(
      {
        format,
        target: new StreamTarget(writable, { chunked: true }),
      },
      {
        codec: opts.codec,
        bitrate:
          opts.qualityMode === "manual"
            ? opts.bitrate * 1000
            : QUALITY_SETTINGS[opts.quality],
      },
      () => {
        setRecordingDone(true);
        setTimeout(() => setRecordingDone(false), 2000);
      },
    );
    animation.startRecording();
  };

  return (
    <Dialog
      trigger={trigger}
      open={open}
      onOpenChange={onOpenChange}
      title="Record"
      description="Record and export an animation"
      modal
      onInteractOutside={(e) => e.preventDefault()}
      disableClose={animation.recording}
    >
      <div className="flex-1 flex flex-col p-3 gap-3 overflow-auto">
        <div className="flex flex-col gap-1.5">
          <div className="text-xs/3 font-semibold text-white/60 ml-1">
            Recording framerate
          </div>
          <ToggleGroup
            type="single"
            value={opts.framerate.toString()}
            onValueChange={(val) => {
              if (val)
                animation.setRecordingOptions({ framerate: Number(val) });
            }}
            disabled={animation.recording}
          >
            <ToggleItem icon className="grow" variant="outline" value="25">
              25
            </ToggleItem>
            <ToggleItem icon className="grow" variant="outline" value="30">
              30
            </ToggleItem>
            <ToggleItem icon className="grow" variant="outline" value="50">
              50
            </ToggleItem>
            <ToggleItem icon className="grow" variant="outline" value="60">
              60
            </ToggleItem>
            <ToggleItem icon className="grow" variant="outline" value="120">
              120
            </ToggleItem>
          </ToggleGroup>
        </div>

        <C.Root>
          <C.Trigger asChild>
            <Button
              variant="ghost"
              className="w-full !justify-between !px-2 group"
            >
              <div className="text-xs/3 font-semibold text-white/60">
                Advanced options
              </div>
              <LuChevronDown className="group-data-[state=open]:rotate-180 transition-transform duration-200" />
            </Button>
          </C.Trigger>
          <C.Content className="mt-2 flex flex-col gap-3">
            <div className="grid grid-cols-[2fr_1fr] gap-x-2 gap-y-1.5">
              <div className="text-xs/3 font-semibold text-white/60 ml-1">
                Format
              </div>
              <div className="text-xs/3 font-semibold text-white/60 ml-1">
                Codec
              </div>

              <ToggleGroup
                type="single"
                value={opts.format}
                onValueChange={(val: VideoFormat) => {
                  if (val) animation.setRecordingOptions({ format: val });
                }}
                disabled={animation.recording}
              >
                <ToggleItem icon className="grow" variant="outline" value="mp4">
                  MP4
                </ToggleItem>
                <ToggleItem icon className="grow" variant="outline" value="mov">
                  MOV
                </ToggleItem>
                <ToggleItem icon className="grow" variant="outline" value="mkv">
                  MKV
                </ToggleItem>
                <ToggleItem
                  icon
                  className="grow"
                  variant="outline"
                  value="webm"
                >
                  WebM
                </ToggleItem>
              </ToggleGroup>

              <Select
                size="sm"
                variant="outline"
                value={opts.codec}
                onValueChange={(codec: VideoCodec) =>
                  animation.setRecordingOptions({ codec })
                }
              >
                {VIDEO_FORMATS[opts.format]
                  .get()
                  .getSupportedVideoCodecs()
                  .map((codec) => (
                    <SelectItem size="sm" key={codec} value={codec}>
                      {codec.toUpperCase()}
                    </SelectItem>
                  ))}
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
              <div className="text-xs/3 font-semibold text-white/60 ml-1">
                Quality
              </div>
              <div className="text-xs/3 font-semibold text-white/60 ml-1">
                {opts.qualityMode === "manual" ? "Bitrate (kbps)" : ""}
              </div>

              <ToggleGroup
                type="single"
                value={opts.qualityMode}
                onValueChange={(qualityMode: "auto" | "manual") => {
                  if (qualityMode)
                    animation.setRecordingOptions({ qualityMode });
                }}
                disabled={animation.recording}
              >
                <ToggleItem
                  icon
                  className="grow"
                  variant="outline"
                  value="auto"
                >
                  Auto
                </ToggleItem>
                <ToggleItem
                  icon
                  className="grow"
                  variant="outline"
                  value="manual"
                >
                  Manual
                </ToggleItem>
              </ToggleGroup>

              {opts.qualityMode === "manual" ? (
                <NumberDrag
                  value={opts.bitrate}
                  onChange={(bitrate) =>
                    animation.setRecordingOptions({ bitrate })
                  }
                  step={10}
                  min={100}
                />
              ) : (
                <Select
                  size="sm"
                  variant="outline"
                  value={opts.quality}
                  onValueChange={(quality: keyof typeof QUALITY_SETTINGS) =>
                    animation.setRecordingOptions({ quality })
                  }
                >
                  {Object.keys(QUALITY_SETTINGS).map((quality) => (
                    <SelectItem size="sm" key={quality} value={quality}>
                      {quality}
                    </SelectItem>
                  ))}
                </Select>
              )}
            </div>
          </C.Content>
        </C.Root>

        <Button
          size="lg"
          variant="outline"
          onClick={record}
          disabled={animation.recording || recordingDone}
          className="relative overflow-hidden mt-auto"
        >
          {recordingDone ? (
            <>
              <LuCircleCheckBig className="text-green-400" /> Done!
            </>
          ) : animation.recording ? (
            <>
              <div
                className="absolute inset-0 bg-current/10"
                style={{
                  width: `${animation.time / (animation.options.duration * 10)}%`,
                }}
              />
              <LuCircle className="text-red-400 animate-pulse relative" />{" "}
              <span className="relative">Recording...</span>
            </>
          ) : (
            <>
              <LuCircle className="text-red-400" /> Record
            </>
          )}
        </Button>
      </div>
    </Dialog>
  );
}
