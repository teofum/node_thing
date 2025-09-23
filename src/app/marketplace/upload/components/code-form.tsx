import { Button, LinkButton } from "@/ui/button";
import { saveCode, generateShaderCode } from "../actions";

type ShaderInput = { name: string; type: "color" | "number" };
type ShaderOutput = { name: string; type: "color" | "number" };

interface CodeFormProps {
  draftId: string;
  initialCode: string;
  inputs: ShaderInput[];
  outputs: ShaderOutput[];
}

export async function CodeForm({
  draftId,
  initialCode,
  inputs,
  outputs,
}: CodeFormProps) {
  const inputsArray = Object.values(inputs);
  const outputsArray = Object.values(outputs);
  const generatedCode = await generateShaderCode(inputsArray, outputsArray);

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Generated code (read-only)
        </label>
        <textarea
          value={generatedCode}
          readOnly
          rows={Math.max(8, generatedCode.split("\n").length + 2)}
          className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-white font-mono text-sm resize-none opacity-75"
        />
      </div>

      <form action={saveCode}>
        <input type="hidden" name="id" value={draftId} />
        <label className="block text-sm font-medium text-white mb-2">
          Main Function
        </label>
        <textarea
          name="code"
          defaultValue={initialCode}
          rows={Math.max(6, initialCode.split("\n").length + 2)}
          className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-white font-mono text-sm resize-y"
          required
        />

        <div className="flex justify-end mt-6">
          <div className="flex gap-3">
            <LinkButton href="/marketplace" variant="outline">
              Cancel
            </LinkButton>
            <Button type="submit">Next</Button>
          </div>
        </div>
      </form>
    </div>
  );
}
