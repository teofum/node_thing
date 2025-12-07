"use client";

import { startTransition } from "react";
import { useTutorialStore } from "@/store/tutorial.store";
import { signOutAction } from "../actions";
import { Button } from "@/ui/button";
import { LuLogOut } from "react-icons/lu";

export function SignOutButton() {
  const end = useTutorialStore((s) => s.endTutorial);

  return (
    <Button
      type="submit"
      variant="ghost"
      className="text-red-400 w-full"
      onClick={() => {
        end();

        startTransition(() => signOutAction());
      }}
    >
      <LuLogOut />
      Sign out
    </Button>
  );
}
