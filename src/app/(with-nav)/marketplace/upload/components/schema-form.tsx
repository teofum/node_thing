"use client";

import { useState } from "react";
import { Button, LinkButton } from "@/ui/button";
import { Input } from "@/ui/input";
import { Select, SelectItem } from "@/ui/select";
import { saveSchema } from "../actions";

type SchemaItem = { name: string; type: "color" | "number" };

interface SchemaFormProps {
  draftId: string;
  initialInputs: SchemaItem[];
  initialOutputs: SchemaItem[];
  error?: string;
}

export function SchemaForm({
  draftId,
  initialInputs,
  initialOutputs,
  error,
}: SchemaFormProps) {
  const [inputs, setInputs] = useState(initialInputs);
  const [outputs, setOutputs] = useState(initialOutputs);

  const addRemoveIO = (
    items: SchemaItem[],
    setItems: (items: SchemaItem[]) => void,
  ) => ({
    add: () =>
      setItems([
        ...items,
        { name: items.length === 0 ? "input" : "", type: "color" },
      ]),
    remove: (index: number) => setItems(items.filter((_, i) => i !== index)),
    update: (index: number, field: "name" | "type", value: string) => {
      const newItems = [...items];
      newItems[index] = { ...newItems[index], [field]: value };
      setItems(newItems);
    },
  });

  const inputActions = addRemoveIO(inputs, setInputs);
  const outputActions = addRemoveIO(outputs, setOutputs);

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Inputs</h3>
          <Button type="button" onClick={inputActions.add}>
            Add Input
          </Button>
        </div>

        <div className="space-y-4">
          {inputs.map((input, index) => (
            <div key={index} className="flex items-center gap-4">
              <Input
                type="text"
                placeholder="Input name"
                className="flex-1 text-white"
                value={input.name}
                onChange={(e) =>
                  inputActions.update(index, "name", e.target.value)
                }
                required
              />
              <Select
                value={input.type}
                onValueChange={(value) =>
                  inputActions.update(index, "type", value)
                }
                className="text-white max-w-24 shrink-0"
              >
                <SelectItem value="color">Color</SelectItem>
                <SelectItem value="number">Number</SelectItem>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="md"
                icon
                onClick={() => inputActions.remove(index)}
              >
                ×
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Outputs</h3>
          <Button type="button" onClick={outputActions.add}>
            Add Output
          </Button>
        </div>

        <div className="space-y-4">
          {outputs.map((output, index) => (
            <div key={index} className="flex items-center gap-4">
              <Input
                type="text"
                placeholder="Output name"
                className="flex-1 text-white"
                value={output.name}
                onChange={(e) =>
                  outputActions.update(index, "name", e.target.value)
                }
                required
              />
              <Select
                value={output.type}
                onValueChange={(value) =>
                  outputActions.update(index, "type", value)
                }
                className="text-white max-w-24 shrink-0"
              >
                <SelectItem value="color">Color</SelectItem>
                <SelectItem value="number">Number</SelectItem>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="md"
                icon
                onClick={() => outputActions.remove(index)}
              >
                ×
              </Button>
            </div>
          ))}
        </div>
      </div>

      <form action={saveSchema}>
        <input type="hidden" name="id" value={draftId} />
        <input type="hidden" name="step" value={2} />

        <input
          type="hidden"
          name="inputs"
          value={JSON.stringify(
            inputs.reduce(
              (acc, input) => {
                acc[input.name] = { name: input.name, type: input.type };
                return acc;
              },
              {} as Record<string, { name: string; type: string }>,
            ),
          )}
        />
        <input
          type="hidden"
          name="outputs"
          value={JSON.stringify(
            outputs.reduce(
              (acc, output) => {
                acc[output.name] = { name: output.name, type: output.type };
                return acc;
              },
              {} as Record<string, { name: string; type: string }>,
            ),
          )}
        />

        {error && (
          <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {decodeURIComponent(error)}
          </div>
        )}

        <div className="flex justify-between mt-6">
          <LinkButton href="/marketplace" variant="outline">
            Cancel
          </LinkButton>
          <Button type="submit">Next</Button>
        </div>
      </form>
    </div>
  );
}
