"use client";

import { useMainStore } from "@/store/main.store";
import { Menu, MenuItem } from "@/ui/menu-bar";
import { LuPause, LuPlay, LuSquare } from "react-icons/lu";

export function AnimationMenu() {
  const animation = useMainStore((s) => s.properties.animation);

  const toggleAnimationState = useMainStore((s) => s.toggleAnimationState);
  const resetAnimationTimer = useMainStore((s) => s.resetAnimationTimer);
  const setAnimationSpeed = useMainStore((s) => s.setAnimationSpeed);

  const stop = () => {
    toggleAnimationState("stopped");
    resetAnimationTimer();
  };

  return (
    <Menu label="Animation" value="animation">
      <MenuItem
        icon={animation.state === "running" ? <LuPause /> : <LuPlay />}
        onClick={() => toggleAnimationState()}
      >
        {animation.state === "running" ? "Pause" : "Play"}
      </MenuItem>

      <MenuItem icon={<LuSquare />} onClick={stop}>
        Stop
      </MenuItem>
    </Menu>
  );
}
