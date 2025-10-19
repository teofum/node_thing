"use client";

import { Dialog, DialogClose } from "@/ui/dialog";
import { Input } from "@/ui/input";
import { ReactNode, useRef, useState } from "react";
import { Button } from "@/ui/button";
import { changePassword } from "../actions/settings";

type PasswordEditorProps = {
  trigger: ReactNode;
};

export default function PasswordEditor({ trigger }: PasswordEditorProps) {
  const currentPasswordRef = useRef<HTMLInputElement>(null);
  const newPasswordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <Dialog trigger={trigger} title="Change Password" description="">
      <div className="flex flex-col p-4 text-lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Current Password</label>
            <Input
              ref={currentPasswordRef}
              type="password"
              variant="outline"
              size="md"
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">New Password</label>
            <Input
              ref={newPasswordRef}
              type="password"
              variant="outline"
              size="md"
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Confirm New Password</label>
            <Input
              ref={confirmPasswordRef}
              type="password"
              variant="outline"
              size="md"
              className="w-full"
            />
          </div>
        </div>
        {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
        <div className="flex justify-end gap-2 mt-4">
          <Button
            onClick={async () => {
              if (
                currentPasswordRef.current &&
                newPasswordRef.current &&
                confirmPasswordRef.current
              ) {
                const current = currentPasswordRef.current.value;
                const newPass = newPasswordRef.current.value;
                const confirm = confirmPasswordRef.current.value;

                setError(null);

                if (current.length === 0) {
                  setError("Current password is required");
                  return;
                }

                if (newPass.length < 6) {
                  setError("New password must be at least 6 characters");
                  return;
                }

                if (newPass !== confirm) {
                  setError("New passwords do not match");
                  return;
                }

                try {
                  await changePassword(current, newPass);
                  window.location.reload();
                } catch (err) {
                  setError(
                    err instanceof Error
                      ? err.message
                      : "Failed to change password",
                  );
                }
              }
            }}
          >
            Change Password
          </Button>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
        </div>
      </div>
    </Dialog>
  );
}
