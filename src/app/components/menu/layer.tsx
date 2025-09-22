"use client";

import { useStore } from "@/store/store";
import {
  Menu,
  MenuItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
} from "@/ui/menu-bar";
import { handleExport } from "@/utils/handle-export";
import { handleImport } from "@/utils/handle-import";
import {
  LuExpand,
  LuPlus,
  LuSquareArrowOutDownLeft,
  LuSquareArrowOutUpRight,
} from "react-icons/lu";

export function LayerMenu() {
  const canvas = useStore((s) => s.properties.canvas);

  const layers = useStore((s) => s.layers);
  const currentLayer = useStore((s) => s.currentLayer);
  const addLayer = useStore((s) => s.addLayer);
  const exportLayer = useStore((s) => s.exportLayer);
  const importLayer = useStore((s) => s.importLayer);
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
      <MenuItem icon={<LuExpand />} onClick={fitLayerToCanvas}>
        Fit to Canvas
      </MenuItem>
      <MenuItem
        icon={<LuSquareArrowOutUpRight />}
        onClick={() =>
          handleExport(exportLayer(currentLayer), layers[currentLayer].name)
        }
      >
        Export
      </MenuItem>

      <MenuSeparator />

      <MenuItem icon={<LuPlus />} onClick={addLayer}>
        New
      </MenuItem>
      <MenuItem
        icon={<LuSquareArrowOutDownLeft />}
        onClick={() => handleImport(importLayer)}
      >
        Import
      </MenuItem>

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
    </Menu>
  );
}
