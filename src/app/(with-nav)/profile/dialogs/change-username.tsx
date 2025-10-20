"use client";

import { Dialog, DialogClose } from "@/ui/dialog";
import { Input } from "@/ui/input";
import { ReactNode, useRef, useState } from "react";
import { UserData } from "../page";
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
  const usernameRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  return (
    <Dialog trigger={trigger} title={title} description="">
      <div className="flex flex-col p-4 text-lg gap-4">
        <h1 className="mb-2">Username</h1>
        <Input
          ref={usernameRef}
          variant="outline"
          size="md"
          className="min-w-40"
          defaultValue={userData.username}
        />
        {error && <p className="text-sm text-red-400 mt-1">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button
            onClick={async () => {
              if (usernameRef.current) {
                const username = usernameRef.current.value;
                setError(null);

                if (username.length === 0) {
                  setError("Username cannot be empty");
                  return;
                }

                setIsPending(true);
                const isAvailable = await checkUsernameAvailable(username);
                if (!isAvailable) {
                  setError("Username already taken");
                  setIsPending(false);
                  return;
                }

                await setUsername(username);
                setIsPending(false);
                setSuccess(true);
                router.refresh();
                setTimeout(() => setSuccess(false), 2000);
              }
            }}
            disabled={isPending || success}
          >
            {isPending ? "Saving..." : success ? "✓ Saved!" : "Apply"}
          </Button>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
        </div>
      </div>
    </Dialog>
  );
}
