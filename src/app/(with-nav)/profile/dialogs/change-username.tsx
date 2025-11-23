"use client";

import { Dialog, DialogClose } from "@/ui/dialog";
import { ReactNode, startTransition, useActionState, useState } from "react";
import { UserData } from "../page";
import { Button } from "@/ui/button";
import { setUsername } from "../actions/settings";

type AccountEditorProps = {
  trigger: ReactNode;
  title: string;
  userData: UserData;
};

export default function AccountEditor({
  trigger,
  title,
  userData,
}: AccountEditorProps) {
  const [name, setName] = useState(userData.username ?? "");

  // TODO pending behaviour
  const [setUsernameState, setUsernameAction, setUsernamePending] =
    useActionState(async () => await setUsername(name), null);

  return (
    <Dialog trigger={trigger} title="Edit Username" description="">
      <div className="flex flex-col p-4 text-lg gap-4">
        <h1 className="mb-2">Username</h1>
        <textarea
          className="text-sm resize-none max-w-full w-full outline-none p-2 rounded-lg border border-white/15"
          placeholder="Your username"
          value={name}
          rows={1}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            onClick={() => startTransition(() => setUsernameAction())}
            disabled={setUsernamePending}
          >
            {setUsernamePending ? "Applying..." : "Apply"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
