import { ComponentProps, useState } from "react";

import { Dialog, DialogClose } from "@/ui/dialog";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";

import { Tables } from "@/lib/supabase/database.types";
import { publishProject } from "../actions";
import { useRouter } from "next/navigation";

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

  const router = useRouter();

  async function handlePublish(id: string, price: number) {
    // TODO invalid price error handling

    publishProject(id, price);

    router.refresh();
  }

  return (
    <Dialog
      trigger={trigger}
      title={"Publish " + type}
      description="Publish things lol"
      className="w-2/5"
      {...props}
    >
      <div className="h-full min-h-0 overflow-auto p-4 border-white/15 ">
        <div className="font-semibold text-xl mb-4">Price</div>

        <Input
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          type=""
          autoFocus
          className="w-full"
        />
      </div>
      <div className="flex justify-between p-4 mt-15">
        <DialogClose asChild>
          <Button variant="outline">Close</Button>
        </DialogClose>

        <DialogClose asChild>
          <Button
            icon
            variant="outline"
            onClick={() => handlePublish(id, price)}
          >
            Publish
          </Button>
        </DialogClose>
      </div>
    </Dialog>
  );
}
