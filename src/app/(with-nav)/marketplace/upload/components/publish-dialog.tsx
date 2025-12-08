import { ComponentProps, useActionState } from "react";

import { Dialog, DialogClose } from "@/ui/dialog";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Select, SelectItem } from "@/ui/select";

import { Tables } from "@/lib/supabase/database.types";
import { publishProject, publishShader } from "../actions";
import { Tooltip } from "@/ui/tooltip";
import { ImagePicker } from "./image-picker";

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
      const image = formData.get("image") as File | null;

      if (type === "shader") {
        const categoryId = Number(formData.get("categoryId"));
        await publishShader(id, price, description, categoryId, image);
      } else {
        await publishProject(id, price, description, image);
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
          <div className="font-semibold text-lg mt-3">Price</div>

          <div className="flex items-center gap-2">
            <Input
              name="price"
              type="number"
              defaultValue=""
              autoFocus
              className="w-full"
              required
            />
            <Tooltip
              content={
                "Currently AR$ (Argentine Peso) is the only supported currency"
              }
              side={"right"}
              delay={200}
            >
              <p>AR$</p>
            </Tooltip>
          </div>

          <div className="font-semibold text-lg mt-4">Description</div>
          <Input name="description" defaultValue="" className="w-full" />

          {type === "shader" && (
            <>
              <div className="font-semibold text-lg mt-4">Category</div>
              <Select name="categoryId" defaultValue="0">
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>
                    {cat.name}
                  </SelectItem>
                ))}
              </Select>
            </>
          )}

          <div className="font-semibold text-lg mt-4">Image</div>
          <ImagePicker name="image" />
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
