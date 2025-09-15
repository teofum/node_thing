import { NODE_TYPES } from "@/utils/node-type";

import { RenderShaderNode } from "./shader-node";
import { NodeType } from "@/schemas/node.schema";
import * as Accordion from "@radix-ui/react-accordion";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/ui/accordion";
import { Fragment } from "react";

export function MenuLibrary() {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("type", nodeType);
  };

  // Group nodes by category
  const nodesByCategory: Record<string, Record<string, NodeType>> = {};
  Object.entries(NODE_TYPES)
    .filter(([key]) => !key.startsWith("__output"))
    .forEach(([key, type]) => {
      if (!nodesByCategory[type.category]) nodesByCategory[type.category] = {};
      nodesByCategory[type.category][key] = type;
    });

  return (
    <div className="border-t border-white/15 flex flex-col gap-3 min-h-0 overflow-auto">
      <Accordion.Root type="multiple">
        {Object.entries(nodesByCategory).map(([category, types]) => (
          <Fragment key={category}>
            <AccordionItem value={category}>
              <AccordionTrigger className="font-semibold text-sm/4 hover:bg-white/8 transition duration-80">
                {category}
              </AccordionTrigger>
              <AccordionContent className="border-b border-white/15">
                <div className="flex flex-col gap-3 p-1">
                  {Object.entries(types).map(([key]) => (
                    <div
                      key={key}
                      className="cursor-grab"
                      onDragStart={(event) => onDragStart(event, key)}
                      draggable
                    >
                      <RenderShaderNode
                        mock
                        id={key}
                        data={{
                          type: key as keyof typeof NODE_TYPES,
                          defaultValues: {},
                          parameters: {},
                        }}
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
              </AccordionContent>
            </AccordionItem>
          </Fragment>
        ))}
      </Accordion.Root>
    </div>
  );
}
