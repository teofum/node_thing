import { ComponentProps, useState } from "react";

import { Dialog, DialogClose } from "@/ui/dialog";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";

import { Tables } from "@/lib/supabase/database.types";

type PublishDialogProps = {
  trigger: ComponentProps<typeof Dialog>["trigger"];
  type: "shader" | "project"; // TODO grupos de shader
  id: string;
  open?: ComponentProps<typeof Dialog>["open"];
  onOpenChange?: ComponentProps<typeof Dialog>["onOpenChange"];
};

export function PublishDialog({
  trigger,
  type,
  id,
  ...props
}: PublishDialogProps) {
  const [price, setPrice] = useState(0);

  async function handlePublish() {
    // TODO
  }

  return (
    <Dialog
      trigger={trigger}
      title={"Publish" + type}
      description="Publish things lol"
      className="w-3/5"
      {...props}
    >
      <div className="h-full min-h-0 overflow-auto p-4 border-white/15">
        <div className="font-semibold text-xl mb-4">Projects</div>

        <Input
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          type="number"
          autoFocus
          className="w-full"
        />

        <Button icon variant="outline" onClick={() => handlePublish()}>
          Publish
        </Button>
      </div>

      <div className="p-3 flex justify-end gap-2">
        <DialogClose asChild>
          <Button variant="outline">Close</Button>
        </DialogClose>
      </div>
    </Dialog>
  );
}
