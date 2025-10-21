import { ComponentProps, useState } from "react";

import { Dialog, DialogClose } from "@/ui/dialog";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Select, SelectItem } from "@/ui/select";

import { Tables } from "@/lib/supabase/database.types";
import { publishProject, publishShader } from "../actions";
import { useRouter } from "next/navigation";

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
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<number>(categories[0]?.id || 1);

  const router = useRouter();

  async function handlePublish(
    id: string,
    priceStr: string,
    description: string,
  ) {
    const price = Number(priceStr) || 0;
    if (type === "shader") {
      await publishShader(id, price, description, categoryId);
    } else {
      await publishProject(id, price, description);
    }

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
      <div className="h-full min-h-0 overflow-auto p-4 border-white/15">
        <div className="font-semibold text-3x1 mt-3">Price</div>

        <Input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          type="number"
          autoFocus
          className="w-full"
        />

        <div className="font-semibold text-3x1 mt-4">Description</div>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          type=""
          className="w-full"
        />

        {type === "shader" && (
          <>
            <div className="font-semibold text-3x1 mt-4">Category</div>
            <Select
              value={categoryId.toString()}
              onValueChange={(value) => setCategoryId(Number(value))}
            >
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
          <Button variant="outline">Close</Button>
        </DialogClose>

        <DialogClose asChild>
          <Button
            icon
            variant="outline"
            onClick={() => handlePublish(id, price, description)}
          >
            Publish
          </Button>
        </DialogClose>
      </div>
    </Dialog>
  );
}
