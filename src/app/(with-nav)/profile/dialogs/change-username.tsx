"use client";

import { Dialog, DialogClose } from "@/ui/dialog";
import { ReactNode } from "react";
import { UserData } from "../actions/user";
import { Button } from "@/ui/button";
import { setUsername } from "../actions/settings";
import { ErrorBoundary } from "react-error-boundary";

type AccountEditorProps = {
  trigger: ReactNode;
  userData: UserData;
};

function UsernameForm({ userData }: { userData: UserData }) {
  return (
    <form action={setUsername} className="flex flex-col p-4 text-lg gap-4">
      <input
        type="hidden"
        name="currentUsername"
        value={userData.username ?? ""}
      />
      <h1 className="mb-2">Username</h1>
      <input
        name="username"
        type="text"
        className="text-sm max-w-full w-full outline-none p-2 rounded-lg border border-white/15"
        placeholder="Your username"
        defaultValue={userData.username ?? ""}
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

export default function AccountEditor({
  trigger,
  userData,
}: AccountEditorProps) {
  return (
    <Dialog trigger={trigger} title="Edit Username" description="">
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <UsernameForm userData={userData} />
      </ErrorBoundary>
    </Dialog>
  );
}
