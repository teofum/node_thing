"use client";

import { Dialog, DialogClose } from "@/ui/dialog";
import { Input } from "@/ui/input";
import { ReactNode, useRef, useState } from "react";
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
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <Dialog trigger={trigger} title="Edit Display Name" description="">
      <div className="flex flex-col p-4 text-lg gap-4">
        <h1 className="mb-2">Display Name</h1>
        <Input
          ref={displayNameRef}
          variant="outline"
          size="md"
          className="min-w-40"
          defaultValue={currentDisplayName}
          placeholder="Your display name"
        />
        {error && <p className="text-sm text-red-400 mt-1">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button
            onClick={async () => {
              if (displayNameRef.current) {
                const displayName = displayNameRef.current.value.trim();
                setError(null);

                if (displayName.length === 0) {
                  setError("Display name cannot be empty");
                  return;
                }

                setIsPending(true);
                try {
                  await setDisplayName(displayName);
                  window.location.reload();
                } catch (err) {
                  setError(
                    err instanceof Error
                      ? err.message
                      : "Failed to update display name",
                  );
                  setIsPending(false);
                }
              }
            }}
            disabled={isPending}
          >
            {isPending ? "Saving..." : "Apply"}
          </Button>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
        </div>
      </div>
    </Dialog>
  );
}
