"use client";

import { useStore } from "@/store/store";
import { Menu, MenuItem } from "@/ui/menu-bar";

export function LayerMenu() {
  const canvas = useStore((s) => s.properties.canvas);
  const setLayerBounds = useStore((s) => s.setLayerBounds);

  const fitLayerToCanvas = () => {
    setLayerBounds(0, 0, canvas.width, canvas.height);
  };

  return (
    <Menu label="Layer" value="layer">
      <MenuItem onClick={fitLayerToCanvas}>Fit to canvas</MenuItem>
    </Menu>
  );
}
