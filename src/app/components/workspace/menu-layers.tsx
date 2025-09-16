import { ToggleGroup, ToggleGroupItem } from "@radix-ui/react-toggle-group";
import { LuEllipsisVertical, LuGripVertical, LuPlus } from "react-icons/lu";
import cn from "classnames";

import { Button } from "@/ui/button";
import { useStore } from "@/store/store";

export function MenuLayers() {
  const { setActiveLayer, addLayer, layers, currentLayer } = useStore();

  const addLayerButton = () => {
    addLayer();
    setActiveLayer(layers.length);
  };

  return (
    <div className="border-t border-white/15 flex flex-col min-h-0 overflow-auto">
      <ToggleGroup
        type="single"
        value={currentLayer.toString()}
        onValueChange={(v) => setActiveLayer(Number(v))}
        orientation="vertical"
        className="flex flex-col-reverse"
      >
        {layers.map((_, idx) => (
          <div
            key={idx}
            className={cn(
              "relative p-3 pl-1 gap-3 flex flex-row items-center border-b border-white/15 hover:bg-white/5",
              { "bg-white/5": idx === currentLayer },
            )}
          >
            <LuGripVertical className="text-white/40" />
            <ToggleGroupItem
              value={idx.toString()}
              className="absolute inset-0 cursor-pointer"
            />
            <div className="grow flex flex-col gap-1">
              <div className="text-sm/4 font-semibold">Layer {idx + 1}</div>
              <div className="text-xs/4 font-medium text-white/65">
                {layers[idx].nodes.length} node
                {layers[idx].nodes.length === 1 ? "" : "s"}
              </div>
            </div>
            <Button icon variant="ghost" className="relative z-10">
              <LuEllipsisVertical />
            </Button>
          </div>
        ))}
      </ToggleGroup>

      <div className="p-3 flex flex-col">
        <Button variant="outline" onClick={addLayerButton}>
          <LuPlus />
          Add Layer
        </Button>
      </div>
    </div>
  );
}
