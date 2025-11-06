"use client";

import { Dialog, DialogClose } from "@/ui/dialog";
import { ReactNode, useState } from "react";
import { Button } from "@/ui/button";
import { setDisplayName } from "../actions/settings";

type DisplayNameEditorProps = {
  trigger: ReactNode;
  currentDisplayName: string;
};

export default function DisplayNameEditor({
  trigger,
  currentDisplayName,
}: DisplayNameEditorProps) {
  const [name, setName] = useState(currentDisplayName ?? "");

  const displayNameChangeHandler = async () => {
    await setDisplayName(name);
  };

  return (
    <Dialog trigger={trigger} title="Edit Display Name" description="">
      <div className="flex flex-col p-4 text-lg gap-4">
        <h1 className="mb-2">Display Name</h1>
        <textarea
          className="text-sm resize-none max-w-full w-full outline-none p-2 rounded-lg border border-white/15"
          placeholder="Your display name"
          value={name}
          rows={1}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button onClick={() => displayNameChangeHandler()}>Apply</Button>
          </DialogClose>
        </div>
      </div>
    </Dialog>
  );
}
