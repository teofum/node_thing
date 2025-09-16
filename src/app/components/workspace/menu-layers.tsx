import { Button } from "@/ui/button";
import { useStore } from "@/store/store";
import cn from "classnames";

export function MenuLayers() {
  const { setActiveLayer, addLayer, layersDim, currentLayer } = useStore();

  const addLayerButton = () => {
    addLayer();
    setActiveLayer(layersDim);
  };

  return (
    <div className="border-t border-white/15 p-2 flex flex-col gap-3 min-h-0 overflow-auto">
      {Array.from({ length: layersDim }).map((_, idx) => (
        <Button
          key={idx}
          variant={"outline"}
          onClick={() => setActiveLayer(idx)}
          className={cn(
            "transition-colors",
            idx === currentLayer && "bg-white/7",
          )}
        >
          Layer {idx}
        </Button>
      ))}

      <Button variant={"ghost"} onClick={addLayerButton}>
        Add Layer
      </Button>

      <hr className="border-white/15" />

      <Button variant={"ghost"}>Export Layer</Button>
      <Button variant={"ghost"}>Import Layer</Button>
    </div>
  );
}
