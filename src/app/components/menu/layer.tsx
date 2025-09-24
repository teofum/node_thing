"use client";

import { useNodeStore } from "@/store/node.store";
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
  const canvas = useNodeStore((s) => s.properties.canvas);

  const layers = useNodeStore((s) => s.layers);
  const currentLayer = useNodeStore((s) => s.currentLayer);
  const addLayer = useNodeStore((s) => s.addLayer);
  const exportLayer = useNodeStore((s) => s.exportLayer);
  const importLayer = useNodeStore((s) => s.importLayer);
  const setActiveLayer = useNodeStore((s) => s.setActiveLayer);
  const setLayerBounds = useNodeStore((s) => s.setLayerBounds);

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
