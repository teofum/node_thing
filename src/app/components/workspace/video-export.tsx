import { ComponentProps, useState } from "react";
import { Mp4OutputFormat, QUALITY_HIGH, StreamTarget } from "mediabunny";
import { LuCircle, LuCircleCheckBig } from "react-icons/lu";

import { useAnimationStore } from "@/store/animation.store";
import { useUtilityStore } from "@/store/utility.store";
import { Button } from "@/ui/button";
import { Dialog } from "@/ui/dialog";
import { NumberDrag } from "@/ui/number-drag";
import { ToggleGroup, ToggleItem } from "@/ui/toggle-group";
import { openVideoFileForWriting } from "@/utils/video";

type VideoExportProps = {
  trigger: ComponentProps<typeof Dialog>["trigger"];
  open?: ComponentProps<typeof Dialog>["open"];
  onOpenChange?: ComponentProps<typeof Dialog>["onOpenChange"];
};

export function VideoExport({ trigger, open, onOpenChange }: VideoExportProps) {
  const animation = useAnimationStore();
  const createRecorder = useUtilityStore((s) => s.createRecorder);

  const [recordingDone, setRecordingDone] = useState(false);

  const record = async () => {
    const format = new Mp4OutputFormat();

    const writable = await openVideoFileForWriting(format);
    if (!writable) return;

    await createRecorder(
      {
        format,
        target: new StreamTarget(writable, { chunked: true }),
      },
      {
        codec: "avc",
        bitrate: QUALITY_HIGH,
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
      <div className="flex-1 flex flex-col p-3 gap-3">
        <div className="flex flex-col gap-1.5">
          <div className="text-xs/3 font-semibold text-white/60 ml-1">
            Recording framerate
          </div>
          <ToggleGroup
            type="single"
            value={animation.options.recordingFramerate.toString()}
            onValueChange={(val) => {
              if (val)
                animation.setOptions({ recordingFramerate: Number(val) });
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
