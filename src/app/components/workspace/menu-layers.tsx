import { ToggleGroup, ToggleGroupItem } from "@radix-ui/react-toggle-group";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { LuEllipsisVertical, LuGripVertical, LuPlus } from "react-icons/lu";
import cn from "classnames";

import { Button } from "@/ui/button";
import { useStore } from "@/store/store";
import { BsTranslate } from "react-icons/bs";

export function MenuLayers() {
  const setActiveLayer = useStore((s) => s.setActiveLayer);
  const addLayer = useStore((s) => s.addLayer);
  const layers = useStore((s) => s.layers);
  const currentLayer = useStore((s) => s.currentLayer);
  const reorderLayers = useStore((s) => s.reorderLayers);

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

  return (
    <div className="border-t border-white/15 flex flex-col min-h-0 overflow-auto">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="layers">
          {/* TODO quite flex-col-reverse porque rompe dnd */}
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {Array.from({ length: layers.length }).map((_, idx) => (
                <Draggable key={idx} draggableId={`${idx}`} index={idx}>
                  {(provided, snapshot) => (
                    // TODO no supe cómo centrar la preview del dnd (sale como si uno lo agarrase de izq arriba)
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      style={{
                        ...provided.draggableProps.style,
                        position: snapshot.isDragging ? "absolute" : "static",
                      }}
                    >
                      <div
                        key={idx}
                        onClick={() => setActiveLayer(idx)}
                        className={cn(
                          "relative p-3 pl-1 gap-3 flex flex-row items-center border-b border-white/15 hover:bg-white/5",
                          "transition-colors w-full border-white/15 hover:bg-white/5",
                          idx === currentLayer && "bg-white/7",
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
                            Layer {idx + 1}
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
    </div>
  );
}
