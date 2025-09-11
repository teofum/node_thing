import { NODE_TYPES } from "@/utils/node-type";

import { RenderShaderNode } from "./shader-node";
import { NodeType } from "@/schemas/node.schema";

export function MenuLibrary() {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("type", nodeType);
  };

  return (
    <>
      <div className="border-t border-white/15 p-2 flex flex-col gap-3 min-h-0 overflow-auto">
        {(Object.entries(NODE_TYPES) as [keyof typeof NODE_TYPES, NodeType][])
          .filter(([key]) => !key.startsWith("__"))
          .map(([key, type]) => (
            <div
              key={key}
              className=" border-white/15 bg-black/40 rounded-md cursor-grab"
              onDragStart={(event) => onDragStart(event, key)}
              draggable
            >
              <RenderShaderNode
                id={key}
                data={{ type: key }}
                selected={false}
                type={""}
                dragging={false}
                zIndex={0}
                selectable={false}
                deletable={false}
                draggable={false}
                isConnectable={false}
                positionAbsoluteX={0}
                positionAbsoluteY={0}
              />
            </div>
          ))}
      </div>
    </>
  );
}
