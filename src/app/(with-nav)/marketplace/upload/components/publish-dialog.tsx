import { ComponentProps, useActionState } from "react";

import { Dialog, DialogClose } from "@/ui/dialog";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Select, SelectItem } from "@/ui/select";

import { Tables } from "@/lib/supabase/database.types";
import { publishProject, publishShader } from "../actions";

type PublishDialogProps = {
  trigger: ComponentProps<typeof Dialog>["trigger"];
  type: "shader" | "project";
  id: string;
  categories?: Tables<"categories">[];
  open?: ComponentProps<typeof Dialog>["open"];
  onOpenChange?: ComponentProps<typeof Dialog>["onOpenChange"];
};

export function PublishDialog({
  trigger,
  type,
  id,
  categories = [],
  ...props
}: PublishDialogProps) {
  // TODO pending behaviour
  const [handlePublishState, handlePublishAction, handlePublishPending] =
    useActionState(async (_prevState: null, formData: FormData) => {
      const priceStr = formData.get("price") as string;
      const description = formData.get("description") as string;
      const price = Number(priceStr) || 0;

      if (type === "shader") {
        const categoryId = Number(formData.get("categoryId"));
        await publishShader(id, price, description, categoryId);
      } else {
        await publishProject(id, price, description);
      }

      props.onOpenChange?.(false);
      return null;
    }, null);

  return (
    <Dialog
      trigger={trigger}
      title={"Publish " + type}
      description="Fill your post info"
      className="w-2/5"
      {...props}
    >
      <form action={handlePublishAction}>
        <div className="h-full min-h-0 overflow-auto p-4 border-white/15">
          <div className="font-semibold text-3x1 mt-3">Price</div>

          <Input
            name="price"
            type="number"
            defaultValue=""
            autoFocus
            className="w-full"
            required
          />

          <div className="font-semibold text-3x1 mt-4">Description</div>
          <Input name="description" defaultValue="" className="w-full" />

          {type === "shader" && (
            <>
              <div className="font-semibold text-3x1 mt-4">Category</div>
              <Select name="categoryId" defaultValue="0">
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>
                    {cat.name}
                  </SelectItem>
                ))}
              </Select>
            </>
          )}
        </div>
        <div className="flex justify-between p-4 mt-15">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Close
            </Button>
          </DialogClose>

          <Button type="submit" icon variant="outline">
            Publish
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
