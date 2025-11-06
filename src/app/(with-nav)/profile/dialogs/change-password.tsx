"use client";

import { Dialog, DialogClose } from "@/ui/dialog";
import { ReactNode, useState } from "react";
import { Button } from "@/ui/button";
import { changePassword } from "../actions/settings";

type PasswordEditorProps = {
  trigger: ReactNode;
};

export default function PasswordEditor({ trigger }: PasswordEditorProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const passwordChangeHandler = async () => {
    await changePassword(currentPassword, newPassword);
  };

  const passwordsMatch =
    newPassword.length > 0 && newPassword === confirmPassword;

  return (
    <Dialog trigger={trigger} title="Change Password" description="">
      <div className="flex flex-col p-4 text-lg gap-3">
        <h1 className="text-sm/3">Current Password</h1>
        <textarea
          className="text-sm resize-none max-w-full w-full outline-none p-2 rounded-lg border border-white/15  mb-2"
          value={currentPassword}
          rows={1}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <h1 className="text-sm/3">New Password</h1>
        <textarea
          className="text-sm resize-none max-w-full w-full outline-none p-2 rounded-lg border border-white/15  mb-2"
          value={newPassword}
          rows={1}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <h1 className="text-sm/3">Confirm New Password</h1>
        <textarea
          className="text-sm resize-none max-w-full w-full outline-none p-2 rounded-lg border border-white/15  mb-2"
          value={confirmPassword}
          rows={1}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        {!passwordsMatch && confirmPassword.length > 0 && (
          <p className="text-sm text-red-400">Passwords do not match</p>
        )}

        <div className="flex justify-end gap-2">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              onClick={() => passwordChangeHandler()}
              disabled={!passwordsMatch}
            >
              Change Password
            </Button>
          </DialogClose>
        </div>
      </div>
    </Dialog>
  );
}
