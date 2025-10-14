"use client";

import { LuPause, LuPlay, LuRewind, LuSquare } from "react-icons/lu";

import { useAnimationStore } from "@/store/animation.store";
import {
  Menu,
  MenuItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  Submenu,
} from "@/ui/menu-bar";

export function AnimationMenu() {
  const animation = useAnimationStore();

  return (
    <Menu label="Animation" value="animation">
      <MenuItem
        icon={animation.state === "running" ? <LuPause /> : <LuPlay />}
        onClick={animation.toggleState}
      >
        {animation.state === "running" ? "Pause" : "Play"}
      </MenuItem>
      <MenuItem icon={<LuSquare />} onClick={animation.stop}>
        Stop
      </MenuItem>
      <MenuItem icon={<LuRewind />} onClick={animation.reset}>
        Restart
      </MenuItem>

      <MenuSeparator />

      <Submenu label="Animation speed">
        <MenuRadioGroup
          value={animation.options.speed.toString()}
          onValueChange={(val) => {
            if (val) animation.setOptions({ speed: Number(val) });
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
          value={animation.options.framerateLimit.toString()}
          onValueChange={(val) => {
            if (val) animation.setOptions({ framerateLimit: Number(val) });
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
