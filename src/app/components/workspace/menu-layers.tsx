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

export function MenuLayers() {
  const { setActiveLayer, addLayer, layers, currentLayer, reorderLayers } =
    useStore();

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
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {Array.from({ length: layers.length }).map((_, idx) => (
                <Draggable key={idx} draggableId={`${idx}`} index={idx}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      style={{
                        ...provided.draggableProps.style,
                        transform: provided.draggableProps.style?.transform,
                        position: snapshot.isDragging ? "absolute" : undefined,
                      }}
                    >
                      <Button
                        key={idx}
                        variant={"outline"}
                        onClick={() => setActiveLayer(idx)}
                        className={cn(
                          "transition-colors w-full border-white/15 hover:bg-white/5",
                          idx === currentLayer && "bg-white/7",
                        )}
                      >
                        <div {...provided.dragHandleProps} className="z-20">
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
                      </Button>
                    </div>
                  )}
                </Draggable>
              ))}
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
