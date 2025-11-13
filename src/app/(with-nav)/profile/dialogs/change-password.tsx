"use client";

import { Dialog, DialogClose } from "@/ui/dialog";
import { ReactNode } from "react";
import { Button } from "@/ui/button";
import { changePassword } from "../actions/settings";
import { ErrorBoundary } from "react-error-boundary";

function ErrorFallback({ error }: { error: Error }) {
  return <div className="text-red-400 text-sm p-2">{error.message}</div>;
}

type PasswordEditorProps = {
  trigger: ReactNode;
};

export default function PasswordEditor({ trigger }: PasswordEditorProps) {
  return (
    <Dialog trigger={trigger} title="Change Password" description="">
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <form
          action={changePassword}
          className="flex flex-col p-4 text-lg gap-3"
        >
          <h1 className="text-sm/3">Current Password</h1>
          <input
            type="password"
            name="currentPassword"
            className="text-sm max-w-full w-full outline-none p-2 rounded-lg border border-white/15 mb-2"
            required
          />
          <h1 className="text-sm/3">New Password</h1>
          <input
            type="password"
            name="newPassword"
            className="text-sm max-w-full w-full outline-none p-2 rounded-lg border border-white/15 mb-2"
            required
          />
          <h1 className="text-sm/3">Confirm New Password</h1>
          <input
            type="password"
            name="confirmPassword"
            className="text-sm max-w-full w-full outline-none p-2 rounded-lg border border-white/15 mb-2"
            required
          />

          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Change Password</Button>
          </div>
        </form>
      </ErrorBoundary>
    </Dialog>
  );
}
