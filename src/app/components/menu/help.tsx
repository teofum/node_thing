"use client";

import { useState } from "react";
import { LuLightbulb } from "react-icons/lu";

import { Menu, MenuItem } from "@/ui/menu-bar";
import { TutorialsDialog } from "../tutorials/tutorials-dialog";
import { useTutorialStore } from "@/store/tutorial.store";

type HelpMenuProps = {
  tutorialsProgressRemote: Record<string, number> | null;
};

export function HelpMenu({ tutorialsProgressRemote }: HelpMenuProps) {
  const [tutorialsOpen, setTutorialsOpen] = useState(false);
  const syncProgress = useTutorialStore((s) => s.syncProgress);

  const handleOpen = () => {
    if (tutorialsProgressRemote) {
      syncProgress(tutorialsProgressRemote);
    }
    setTutorialsOpen(true);
  };

  return (
    <>
      <Menu label="Help" value="help">
        <MenuItem icon={<LuLightbulb />} onClick={handleOpen}>
          Tutorials
        </MenuItem>
      </Menu>
      <TutorialsDialog open={tutorialsOpen} onOpenChange={setTutorialsOpen} />
    </>
  );
}
