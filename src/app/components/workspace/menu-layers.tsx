import { useState } from "react";
import cn from "classnames";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import {
  LuCopy,
  LuEllipsisVertical,
  LuGripVertical,
  LuPencilLine,
  LuPlus,
  LuSquareArrowOutDownLeft,
  LuSquareArrowOutUpRight,
  LuTrash2,
} from "react-icons/lu";

import { useMainStore } from "@/store/main.store";
import { DropdownMenu, DropdownMenuItem } from "@/ui/dropdown-menu";
import { Input } from "@/ui/input";
import { Button } from "@/ui/button";
import { loadJsonFromFile, saveJsonToFile } from "@/utils/json";

export function MenuLayers() {
  const setActiveLayer = useMainStore((s) => s.setActiveLayer);
  const addLayer = useMainStore((s) => s.addLayer);
  const layers = useMainStore((s) => s.layers);
  const currentLayer = useMainStore((s) => s.currentLayer);
  const reorderLayers = useMainStore((s) => s.reorderLayers);
  const exportLayer = useMainStore((s) => s.exportLayer);
  const importLayer = useMainStore((s) => s.importLayer);
  const changeLayerName = useMainStore((s) => s.changeLayerName);
  const removeLayer = useMainStore((s) => s.removeLayer);
  const duplicateLayer = useMainStore((s) => s.duplicateLayer);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    reorderLayers(result.source.index, result.destination.index);
  };

  const [editingLayerId, setEditingLayerId] = useState<number | null>(null);

  const handleLayerNameChange = (newName: string, idx: number) => {
    if (newName === null || newName === "") return;
    changeLayerName(newName, idx);
    setEditingLayerId(null);
  };

  return (
    <div className="border-t border-white/15 flex flex-col min-h-0 h-full">
      <div className="border-b border-white/15 flex-1 min-h-0 overflow-auto">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="layers">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {layers.map((layer, idx) => (
                  <Draggable key={layer.id} draggableId={layer.id} index={idx}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        style={provided.draggableProps.style}
                      >
                        <div
                          key={idx}
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
                          {/* Hidden button so we don't have nested clickables */}
                          <button
                            className="absolute inset-0 cursor-pointer"
                            onClick={() => setActiveLayer(idx)}
                          />

                          <div
                            {...provided.dragHandleProps}
                            className="relative z-20 flex flex-col"
                          >
                            <LuGripVertical className="text-white/40" />
                          </div>

                          <div
                            className={cn(
                              "grow flex flex-col gap-1 text-left",
                              { "relative z-20": editingLayerId === idx },
                            )}
                          >
                            {editingLayerId === idx ? (
                              <div className="text-sm/4 font-semibold">
                                <form
                                  onSubmit={(e) => {
                                    e.preventDefault();
                                    const formData = new FormData(
                                      e.currentTarget,
                                    );
                                    const newName =
                                      formData.get("layerName")?.toString() ||
                                      "";
                                    handleLayerNameChange(newName, idx);
                                  }}
                                >
                                  <Input
                                    ref={(self) => {
                                      // Set a short timeout because radix messes with focus
                                      setTimeout(() => self?.focus(), 1);
                                    }}
                                    size="sm"
                                    variant="outline"
                                    name="layerName"
                                    defaultValue={layer.name}
                                    onBlur={(e) =>
                                      handleLayerNameChange(
                                        e.currentTarget.value,
                                        idx,
                                      )
                                    }
                                    className="-mx-2 px-1.75 py-1 -my-1.5 !text-sm/4 w-full"
                                  />
                                </form>
                              </div>
                            ) : (
                              <div className="text-sm/4 font-semibold">
                                {layer.name}
                              </div>
                            )}
                            <div className="text-xs/4 font-medium text-white/65">
                              {layers[idx].nodes.length} node
                              {layers[idx].nodes.length === 1 ? "" : "s"}
                            </div>
                          </div>
                          <DropdownMenu
                            trigger={
                              <Button
                                icon
                                variant="ghost"
                                className="relative z-20"
                              >
                                <LuEllipsisVertical />
                              </Button>
                            }
                          >
                            <DropdownMenuItem
                              icon={<LuPencilLine />}
                              onClick={() => setEditingLayerId(idx)}
                            >
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              icon={<LuCopy />}
                              onClick={() => duplicateLayer(idx)}
                            >
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              icon={<LuSquareArrowOutUpRight />}
                              onClick={() =>
                                saveJsonToFile(
                                  exportLayer(idx),
                                  layers[idx].name,
                                )
                              }
                            >
                              Export
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              className="text-red-400"
                              icon={<LuTrash2 />}
                              onClick={() => removeLayer(idx)}
                              disabled={layers.length === 1}
                            >
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenu>
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
      </div>

      <div className="p-3 gap-2 flex flex-col">
        <Button variant="outline" onClick={addLayer}>
          <LuPlus />
          New Layer
        </Button>
        <Button variant="outline" onClick={() => loadJsonFromFile(importLayer)}>
          <LuSquareArrowOutDownLeft />
          Import Layer
        </Button>
      </div>
    </div>
  );
}
