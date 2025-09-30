import {
  ComponentProps,
  Dispatch,
  SetStateAction,
  useRef,
  useState,
} from "react";
import { LuPlus, LuTrash2 } from "react-icons/lu";
import { nanoid } from "nanoid";
import cn from "classnames";

import { Dialog, DialogClose } from "@/ui/dialog";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Select, SelectItem } from "@/ui/select";
import { HandleDescriptor, useMainStore } from "@/store/main.store";

type ShaderEditorProps = {
  trigger: ComponentProps<typeof Dialog>["trigger"];
};

type HandleListProps = {
  handles: HandleDescriptor[];
  setHandles: Dispatch<SetStateAction<HandleDescriptor[]>>;
};

function HandleList({ handles, setHandles }: HandleListProps) {
  return handles.map((hd, i) => {
    const { id, name, display, type } = hd;
    const update = (props: Partial<HandleDescriptor>) => {
      const updated = { ...hd, ...props };
      setHandles([...handles.slice(0, i), updated, ...handles.slice(i + 1)]);
    };
    const remove = () => {
      setHandles([...handles.slice(0, i), ...handles.slice(i + 1)]);
    };

    return (
      <div
        key={id}
        className={cn(
          "grid grid-cols-[auto_1fr_auto] grid-flow-dense gap-2 items-baseline border-b border-white/15 py-2",
          { "border-t": i === 0 },
        )}
      >
        <div className="col-start-3 row-span-3 self-center">
          <Button
            icon
            variant="ghost"
            className="text-red-400"
            onClick={remove}
          >
            <LuTrash2 />
          </Button>
        </div>
        <div className="text-xs/3 font-semibold">Internal name</div>
        <Input
          variant="outline"
          className="min-w-0"
          size="sm"
          value={name}
          onChange={(ev) => update({ name: ev.target.value })}
        />

        <div className="text-xs/3 font-semibold">Display name</div>
        <Input
          variant="outline"
          className="min-w-0"
          size="sm"
          value={display}
          onChange={(ev) => update({ display: ev.target.value })}
        />

        <div className="text-xs/3 font-semibold">Type</div>
        <Select
          value={type}
          onValueChange={(val) =>
            update({ type: val as HandleDescriptor["type"] })
          }
          variant="outline"
          size="sm"
        >
          <SelectItem value="color" size="sm">
            Color
          </SelectItem>
          <SelectItem value="number" size="sm">
            Number
          </SelectItem>
        </Select>
      </div>
    );
  });
}

export function ShaderEditor({ trigger }: ShaderEditorProps) {
  const [inputs, setInputs] = useState<HandleDescriptor[]>([]);
  const [outputs, setOutputs] = useState<HandleDescriptor[]>([]);

  const codeRef = useRef<HTMLTextAreaElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  const createNodeType = useMainStore((s) => s.createNodeType);

  const addInput = () => {
    const id = nanoid();
    setInputs([
      ...inputs,
      {
        id,
        name: `input_${id}`,
        display: "Input",
        type: "color",
      },
    ]);
  };

  const addOutput = () => {
    const id = nanoid();
    setOutputs([
      ...outputs,
      {
        id,
        name: `output_${id}`,
        display: "Output",
        type: "color",
      },
    ]);
  };

  const create = () => {
    if (!nameRef.current || !codeRef.current) return;

    createNodeType({
      name: nameRef.current.value,
      inputs,
      outputs,
      code: codeRef.current.value,
    });
  };

  return (
    <Dialog
      trigger={trigger}
      title="Shader Editor"
      description="Write shaders lol"
    >
      <div className="flex-1 border-b border-white/15 min-h-0 px-3 gap-3 grid grid-cols-[16rem_1fr]">
        <div className="flex flex-col h-full min-h-0 overflow-auto py-3">
          <div className="font-semibold text-sm/4 mb-2">Inputs</div>
          <HandleList handles={inputs} setHandles={setInputs} />
          <Button variant="outline" className="mt-2" onClick={addInput}>
            <LuPlus /> Add Input
          </Button>

          <div className="font-semibold text-sm/4 mt-4 mb-2">Outputs</div>
          <HandleList handles={outputs} setHandles={setOutputs} />
          <Button variant="outline" className="mt-2" onClick={addOutput}>
            <LuPlus /> Add Output
          </Button>
        </div>

        <div className="flex flex-col gap-2 min-h-0 py-3">
          <div className="font-semibold text-sm/4">Name</div>
          <Input
            ref={nameRef}
            variant="outline"
            className="w-full"
            defaultValue="New Shader"
          />
          <textarea
            ref={codeRef}
            className="font-mono text-sm/4 resize-none max-w-full w-xl max-h-full h-full min-h-80 outline-none p-2 rounded-lg bg-black/70 border border-white/15"
          />
        </div>
      </div>

      <div className="p-3 flex flex-row gap-2 justify-end items-end">
        <DialogClose asChild>
          <Button variant="outline" onClick={create}>
            Save shader
          </Button>
        </DialogClose>
      </div>
    </Dialog>
  );
}
