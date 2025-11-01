"use client";

import { Dialog, DialogClose } from "@/ui/dialog";
import { ReactNode, useState } from "react";
import { UserData } from "../actions/user";
import { Button } from "@/ui/button";
import { setUsername, checkUsernameAvailable } from "../actions/settings";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  const accountNameChangeHandler = async () => {
    await setUsername(name);
    router.refresh();
  };

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
          <DialogClose asChild>
            <Button onClick={() => accountNameChangeHandler()}>Apply</Button>
          </DialogClose>
        </div>
      </div>
    </Dialog>
  );
}
