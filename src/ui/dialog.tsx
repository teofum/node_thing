import * as D from "@radix-ui/react-dialog";
import { LuX } from "react-icons/lu";
import cn from "classnames";
import { Button } from "./button";

type DialogProps = Omit<D.DialogProps & D.DialogContentProps, "asChild"> & {
  trigger: React.ReactNode;
  title: React.ReactNode;
  description: React.ReactNode;
};

export function Dialog({
  className,
  children,
  trigger,
  title,
  description,
  ...props
}: DialogProps) {
  return (
    <D.Root {...props}>
      <D.Trigger asChild>{trigger}</D.Trigger>
      <D.Portal>
        <D.Overlay className="fixed inset-0 bg-neutral-700/10 animate-[dialogOverlay_500ms_ease-out_forwards]" />
        <D.Content
          className={cn(
            "fixed top-1/2 left-1/2 -translate-1/2 min-w-md min-h-80 max-w-[calc(100vw-10rem)] max-h-[calc(100vh-10rem)]",
            "glass glass-border rounded-2xl flex flex-col outline-none",
            className,
          )}
          {...props}
        >
          <div className="p-3 border-b border-white/15 flex flex-row items-start">
            <div>
              <D.Title className="text-2xl/6 font-bold">{title}</D.Title>
              <D.Description className="text-xs/3 text-white/65 mt-1">
                {description}
              </D.Description>
            </div>
            <D.Close asChild>
              <Button icon variant="ghost" className="ml-auto">
                <LuX />
              </Button>
            </D.Close>
          </div>
          <div className="flex flex-col grow min-h-0">{children}</div>
        </D.Content>
      </D.Portal>
    </D.Root>
  );
}

export const DialogClose = D.Close;
