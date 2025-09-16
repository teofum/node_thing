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
            <ToggleGroup
              type="single"
              value={currentLayer.toString()}
              onValueChange={(v) => setActiveLayer(Number(v))}
              orientation="vertical"
              className="flex flex-col-reverse"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {layers.map((layer, idx) => (
                <Draggable key={idx} draggableId={`${idx}`} index={idx}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      key={idx}
                      style={{
                        ...provided.draggableProps.style,
                        background: snapshot.isDragging
                          ? "rgba(255,255,255,0.05)"
                          : "transparent",
                        transform: provided.draggableProps.style?.transform
                          ? `${provided.draggableProps.style.transform} translate(-5%, -100%)`
                          : undefined,
                      }}
                      className={cn(
                        "relative p-3 pl-1 gap-3 flex flex-row items-center border-b border-white/15 hover:bg-white/5",
                        { "bg-white/5": idx === currentLayer },
                      )}
                    >
                      <div {...provided.dragHandleProps} className="z-20">
                        <LuGripVertical className="text-white/40" />
                      </div>

                      <ToggleGroupItem
                        value={idx.toString()}
                        className="absolute inset-0 cursor-pointe z-10"
                      />
                      <div className="grow flex flex-col gap-1">
                        <div className="text-sm/4 font-semibold">
                          Layer {idx + 1}
                        </div>
                        <div className="text-xs/4 font-medium text-white/65">
                          {layers[idx].nodes.length} node
                          {layers[idx].nodes.length === 1 ? "" : "s"}
                        </div>
                      </div>
                      <Button icon variant="ghost" className="relative z-10">
                        <LuEllipsisVertical />
                      </Button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ToggleGroup>
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
