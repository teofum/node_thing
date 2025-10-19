"use client";

import { Dialog, DialogClose } from "@/ui/dialog";
import { Input } from "@/ui/input";
import { ReactNode, useRef } from "react";
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
  const displayNameRef = useRef<HTMLInputElement>(null);

  return (
    <Dialog trigger={trigger} title="Edit Display Name" description="">
      <div className="flex flex-col p-4 text-lg h-64">
        <h1 className="mb-2">Display Name</h1>
        <Input
          ref={displayNameRef}
          variant="outline"
          size="md"
          className="min-w-40"
          defaultValue={currentDisplayName}
          placeholder="Your display name"
        />
        <div className="mt-auto flex justify-end gap-2">
          <Button
            onClick={() => {
              if (displayNameRef.current) {
                setDisplayName(displayNameRef.current.value);
                window.location.reload();
              }
            }}
          >
            Apply
          </Button>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
        </div>
      </div>
    </Dialog>
  );
}
