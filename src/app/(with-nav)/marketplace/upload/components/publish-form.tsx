import { Button, LinkButton } from "@/ui/button";
import { Input } from "@/ui/input";
import { Select, SelectItem } from "@/ui/select";
import { publishShader } from "../actions";

interface PublishFormProps {
  draftId: string;
  initialTitle: string;
  initialDescription: string;
  initialPrice: number;
  initialCategoryId: number;
  categories: { id: number; name: string }[];
}

export function PublishForm({
  draftId,
  initialTitle,
  initialDescription,
  initialPrice,
  initialCategoryId,
  categories,
}: PublishFormProps) {
  return (
    <form action={publishShader}>
      <input type="hidden" name="id" value={draftId} />

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Title
          </label>
          <Input
            name="title"
            type="text"
            defaultValue={initialTitle}
            placeholder="Enter shader title"
            className="w-full text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Description
          </label>
          <textarea
            name="description"
            defaultValue={initialDescription}
            placeholder="Describe your shader"
            className="w-full h-32 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-white placeholder-neutral-400"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Category
            </label>
            <Select
              name="category_id"
              defaultValue={initialCategoryId.toString()}
              placeholder="Select category"
              className="w-full text-white"
              required
            >
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Price (USD)
            </label>
            <Input
              name="price"
              type="number"
              min="0"
              step="0.01"
              defaultValue={initialPrice}
              className="w-full text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              required
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <div className="flex gap-3">
          <LinkButton href="/marketplace" variant="outline">
            Cancel
          </LinkButton>
          <Button type="submit">Publish</Button>
        </div>
      </div>
    </form>
  );
}
