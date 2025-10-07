"use client";

import { Dialog, DialogClose } from "@/ui/dialog";
import { Input } from "@/ui/input";
import { ReactNode, useRef } from "react";
import { UserData } from "./page";
import { Button } from "@/ui/button";
import { setUsername } from "./actions";

type AccountEditorProps = {
  trigger: ReactNode;
  title: string;
  userData: UserData;
};

function isValidUsername(name: string) {
  return name.length > 0;
  //TODO: Agregar cualquier restriccion que necesite la DB
}

export default function AccountEditor({
  trigger,
  title,
  userData,
}: AccountEditorProps) {
  const usernameRef = useRef<HTMLInputElement>(null);

  return (
    <Dialog trigger={trigger} title={title} description="">
      <div className="flex flex-col p-4 text-lg h-64">
        <h1 className="mb-2">Username</h1>
        <Input
          ref={usernameRef}
          variant="outline"
          size="md"
          className="min-w-40"
          defaultValue={userData.username}
        />
        <div className="mt-auto flex justify-end gap-2">
          <Button
            onClick={() => {
              if (
                usernameRef.current &&
                isValidUsername(usernameRef.current.value)
              ) {
                setUsername(usernameRef.current.value);
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
