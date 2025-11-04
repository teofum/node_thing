"use client";

import { Dialog, DialogClose } from "@/ui/dialog";
import { ReactNode } from "react";
import { Button } from "@/ui/button";
import { setDisplayName } from "../actions/settings";
import { ErrorBoundary } from "react-error-boundary";

type DisplayNameEditorProps = {
  trigger: ReactNode;
  currentDisplayName: string;
};

function DisplayNameForm({
  currentDisplayName,
}: {
  currentDisplayName: string;
}) {
  return (
    <form action={setDisplayName} className="flex flex-col p-4 text-lg gap-4">
      <h1 className="mb-2">Display Name</h1>
      <input
        name="displayName"
        type="text"
        className="text-sm max-w-full w-full outline-none p-2 rounded-lg border border-white/15"
        placeholder="Your display name"
        defaultValue={currentDisplayName ?? ""}
        required
      />

      <div className="flex justify-end gap-2">
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit">Apply</Button>
      </div>
    </form>
  );
}

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="p-4 text-red-400">
      <p>{error.message}</p>
    </div>
  );
}

export default function DisplayNameEditor({
  trigger,
  currentDisplayName,
}: DisplayNameEditorProps) {
  return (
    <Dialog trigger={trigger} title="Edit Display Name" description="">
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <DisplayNameForm currentDisplayName={currentDisplayName} />
      </ErrorBoundary>
    </Dialog>
  );
}
