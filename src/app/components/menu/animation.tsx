"use client";

import { useMainStore } from "@/store/main.store";
import {
  Menu,
  MenuItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  Submenu,
} from "@/ui/menu-bar";
import { LuPause, LuPlay, LuRewind, LuSquare } from "react-icons/lu";

export function AnimationMenu() {
  const animation = useMainStore((s) => s.properties.animation);

  const toggleAnimationState = useMainStore((s) => s.toggleAnimationState);
  const resetAnimationTimer = useMainStore((s) => s.resetAnimationTimer);
  const setAnimationSpeed = useMainStore((s) => s.setAnimationSpeed);
  const setFramerateLimit = useMainStore((s) => s.setFramerateLimit);

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
      <MenuItem icon={<LuRewind />} onClick={resetAnimationTimer}>
        Restart
      </MenuItem>

      <MenuSeparator />

      <Submenu label="Animation speed">
        <MenuRadioGroup
          value={animation.animationSpeed.toString()}
          onValueChange={(val) => {
            if (val) setAnimationSpeed(Number(val));
          }}
        >
          <MenuRadioItem value="0.25">0.25x</MenuRadioItem>
          <MenuRadioItem value="0.5">0.5x</MenuRadioItem>
          <MenuRadioItem value="1">1x</MenuRadioItem>
          <MenuRadioItem value="2">2x</MenuRadioItem>
        </MenuRadioGroup>
      </Submenu>
      <Submenu label="Framerate limit">
        <MenuRadioGroup
          value={animation.framerateLimit.toString()}
          onValueChange={(val) => {
            if (val) setFramerateLimit(Number(val));
          }}
        >
          <MenuRadioItem value="30">30 fps</MenuRadioItem>
          <MenuRadioItem value="60">60 fps</MenuRadioItem>
          <MenuRadioItem value="120">120 fps</MenuRadioItem>
          <MenuRadioItem value="10000">Off</MenuRadioItem>
        </MenuRadioGroup>
      </Submenu>
    </Menu>
  );
}
