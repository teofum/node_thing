import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import {
  LuEllipsisVertical,
  LuGripVertical,
  LuPlus,
  LuSquareArrowOutDownLeft,
  LuSquareArrowOutUpRight,
} from "react-icons/lu";

import { Button } from "@/ui/button";
import { useStore } from "@/store/store";
import cn from "classnames";

export function MenuLayers() {
  const setActiveLayer = useStore((s) => s.setActiveLayer);
  const addLayer = useStore((s) => s.addLayer);
  const layers = useStore((s) => s.layers);
  const currentLayer = useStore((s) => s.currentLayer);
  const reorderLayers = useStore((s) => s.reorderLayers);
  const exportLayer = useStore((s) => s.exportLayer);
  const importLayer = useStore((s) => s.importLayer);

  const addLayerButton = () => {
    addLayer();
    setActiveLayer(layers.length);
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    reorderLayers(result.source.index, result.destination.index);
  };

  const layerExport = async () => {
    const json = exportLayer(currentLayer);

    const handle = await window.showSaveFilePicker({
      suggestedName: "project.json",
      types: [{ accept: { "application/json": [".json"] } }],
    });

    const writable = await handle.createWritable();
    await writable.write(json);
    await writable.close();
  };

  const layerImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file === undefined) {
        return;
      }

      const json = await file.text();
      importLayer(json); // TODO manejo de errores
    };

    input.click();
  };

  return (
    <div className="border-t border-white/15 flex flex-col min-h-0 overflow-auto">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="layers">
          {/* TODO quite flex-col-reverse porque rompe dnd */}
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {layers.map((layer, idx) => (
                <Draggable key={layer.id} draggableId={layer.id} index={idx}>
                  {(provided, snapshot) => (
                    // TODO no supe cómo centrar la preview del dnd (sale como si uno lo agarrase de izq arriba)
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      style={provided.draggableProps.style}
                    >
                      <div
                        key={idx}
                        onClick={() => setActiveLayer(idx)}
                        className={cn(
                          "relative p-3 pl-1 gap-3 flex flex-row items-center border-b border-white/15 hover:bg-white/5",
                          "transition-colors w-full border-white/15 hover:bg-white/5",
                          {
                            "bg-black/50 backdrop-blur-md border":
                              snapshot.isDragging,
                            "bg-white/7": idx === currentLayer,
                          },
                        )}
                      >
                        <div
                          {...provided.dragHandleProps}
                          className="z-20 flex flex-col"
                        >
                          <LuGripVertical className="text-white/40" />
                        </div>

                        <div className="grow flex flex-col gap-1 text-left">
                          <div className="text-sm/4 font-semibold">
                            {layer.name}
                          </div>
                          <div className="text-xs/4 font-medium text-white/65">
                            {layers[idx].nodes.length} node
                            {layers[idx].nodes.length === 1 ? "" : "s"}
                            {/* TODO acá mostrar nombre layer */}
                          </div>
                        </div>

                        <Button icon variant="ghost" className="relative z-10">
                          <LuEllipsisVertical />
                          {/* TODO acá opción cambiar nombre */}
                        </Button>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <div className="p-3 flex flex-col">
        <Button variant="outline" onClick={addLayerButton}>
          <LuPlus />
          Add Layer
        </Button>
      </div>

      <hr className="border-white/15 p-1" />

      {/* TODO add onClick export/import */}
      <div className="px-3 py-1 flex flex-col">
        <Button variant="outline" onClick={layerImport}>
          <LuSquareArrowOutDownLeft />
          Import Layer
        </Button>
      </div>
      <div className="px-3 py-1 flex flex-col">
        <Button variant="outline" onClick={layerExport}>
          <LuSquareArrowOutUpRight />
          Export Layer
        </Button>
      </div>
    </div>
  );
}
