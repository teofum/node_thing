"use client";

import { useProjectStore } from "@/store/project.store";
import {
  Menu,
  MenuItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
} from "@/ui/menu-bar";
import { saveJsonToFile, loadJsonFromFile } from "@/utils/json";
import {
  LuExpand,
  LuPlus,
  LuSquareArrowOutDownLeft,
  LuSquareArrowOutUpRight,
} from "react-icons/lu";

export function LayerMenu() {
  const canvas = useProjectStore((s) => s.properties.canvas);

  const layers = useProjectStore((s) => s.layers);
  const currentLayer = useProjectStore((s) => s.currentLayer);
  const addLayer = useProjectStore((s) => s.addLayer);
  const exportLayer = useProjectStore((s) => s.exportLayer);
  const importLayer = useProjectStore((s) => s.importLayer);
  const setActiveLayer = useProjectStore((s) => s.setActiveLayer);
  const setLayerBounds = useProjectStore((s) => s.setLayerBounds);

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
          saveJsonToFile(exportLayer(currentLayer), layers[currentLayer].name)
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
        onClick={() => loadJsonFromFile(importLayer)}
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
