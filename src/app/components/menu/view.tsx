"use client";

import {
  Menu,
  MenuCheckboxItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  Submenu,
} from "@/ui/menu-bar";
import { useConfigStore } from "@/store/config.store";

export function ViewMenu() {
  const view = useConfigStore((s) => s.view);
  const updateView = useConfigStore((s) => s.updateView);

  return (
    <>
      <Menu label="View" value="view">
        <MenuCheckboxItem
          checked={view.layerHandles}
          onCheckedChange={(layerHandles) => updateView({ layerHandles })}
        >
          Layer controls
        </MenuCheckboxItem>
        <MenuCheckboxItem
          checked={view.timeline}
          onCheckedChange={(timeline) => updateView({ timeline })}
        >
          Timeline
        </MenuCheckboxItem>
        <MenuCheckboxItem
          checked={view.tooltipsEnabled}
          onCheckedChange={(tooltipsEnabled) => updateView({ tooltipsEnabled })}
        >
          Tooltips on placed nodes
        </MenuCheckboxItem>

        <MenuSeparator />

        <Submenu label="Zoom">
          <MenuRadioGroup
            value={view.zoom.toString()}
            onValueChange={(val) => {
              if (val) updateView({ zoom: Number(val) });
            }}
          >
            <MenuRadioItem value="0.25">25%</MenuRadioItem>
            <MenuRadioItem value="0.5">50%</MenuRadioItem>
            <MenuRadioItem value="1">100%</MenuRadioItem>
            <MenuRadioItem value="2">200%</MenuRadioItem>
          </MenuRadioGroup>
        </Submenu>
      </Menu>
    </>
  );
}
