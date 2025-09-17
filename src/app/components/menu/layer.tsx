"use client";

import { useStore } from "@/store/store";
import {
  Menu,
  MenuItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
} from "@/ui/menu-bar";

export function LayerMenu() {
  const canvas = useStore((s) => s.properties.canvas);

  const layers = useStore((s) => s.layers);
  const currentLayer = useStore((s) => s.currentLayer);
  const addLayer = useStore((s) => s.addLayer);
  const setActiveLayer = useStore((s) => s.setActiveLayer);
  const setLayerBounds = useStore((s) => s.setLayerBounds);

  const fitLayerToCanvas = () => {
    setLayerBounds(0, 0, canvas.width, canvas.height);
  };

  const changeCurrentLayer = (value: string) => {
    setActiveLayer(Number(value));
  };

  return (
    <Menu label="Layer" value="layer">
      <MenuItem onClick={fitLayerToCanvas}>Fit to Canvas</MenuItem>

      <MenuSeparator />

      <MenuRadioGroup
        value={currentLayer.toString()}
        onValueChange={changeCurrentLayer}
      >
        {layers.map((layer, i) => (
          <MenuRadioItem key={layer.id} value={i.toString()}>
            {layer.name}
          </MenuRadioItem>
        ))}
      </MenuRadioGroup>

      <MenuSeparator />

      <MenuItem onClick={addLayer}>New Layer</MenuItem>
    </Menu>
  );
}
