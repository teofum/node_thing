"use client";

import { useState } from "react";
import { LuLightbulb } from "react-icons/lu";

import { Menu, MenuItem } from "@/ui/menu-bar";
import { TutorialsDialog } from "../tutorials/tutorials-dialog";

export function HelpMenu() {
  const [tutorialsOpen, setTutorialsOpen] = useState(false);

  return (
    <>
      <Menu label="Help" value="help">
        <MenuItem icon={<LuLightbulb />} onClick={() => setTutorialsOpen(true)}>
          Tutorials
        </MenuItem>
      </Menu>
      <TutorialsDialog open={tutorialsOpen} onOpenChange={setTutorialsOpen} />
    </>
  );
}
