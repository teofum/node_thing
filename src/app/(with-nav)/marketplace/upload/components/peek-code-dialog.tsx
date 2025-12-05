import { ReactNode } from "react";
import { Dialog } from "@/ui/dialog";

type PeekDialogProps = {
  trigger: ReactNode;
  title: string;
  code: string;
} & React.HTMLAttributes<HTMLDivElement>;

export default function PeekCodeDialog({
  trigger,
  title,
  code,
}: PeekDialogProps) {
  return (
    <Dialog
      trigger={trigger}
      title={title}
      description={"Check the code before publishing"}
    >
      <div className="p-4">
        <textarea
          readOnly
          defaultValue={code}
          className="font-mono text-sm/4 resize-none max-w-full w-xl max-h-full h-full min-h-80 outline-none p-2 rounded-lg bg-black/70 border border-white/15"
        />
      </div>
    </Dialog>
  );
}
