import { ComponentProps } from "react";

import { Dialog, DialogClose } from "./dialog";
import { Button } from "./button";
import cn from "classnames";

type PromptDialogProps = ComponentProps<typeof Dialog> & {
  onConfirm?: () => void;
  danger?: boolean;
  confirmText?: string;
  cancelText?: string;
};

export function PromptDialog({
  children,
  onConfirm,
  danger = false,
  confirmText = "OK",
  cancelText = "Cancel",
  ...props
}: PromptDialogProps) {
  return (
    <Dialog {...props}>
      <div className="p-3 flex-1">{children}</div>
      <div className="p-3 flex flex-row gap-2 justify-end items-end border-t border-white/15">
        <DialogClose asChild>
          <Button variant="outline">{cancelText}</Button>
        </DialogClose>
        <DialogClose asChild>
          <Button
            variant="outline"
            className={cn({ "text-red-400": danger })}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </DialogClose>
      </div>
    </Dialog>
  );
}
