import { RenderShaderNode } from "./shader-node";
import { NodeType } from "@/schemas/node.schema";
import { useMainStore } from "@/store/main.store";
import * as Accordion from "@radix-ui/react-accordion";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/ui/accordion";
import { Fragment } from "react";
import { Button } from "@/ui/button";
import { ShaderEditor } from "./shader-editor";

export function MenuLibrary() {
  const nodeTypes = useMainStore((state) => state.nodeTypes);

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("type", nodeType);
  };

  const nodesByCategory: Record<string, Record<string, NodeType>> = {};
  Object.entries(nodeTypes)
    .filter(([key]) => !key.startsWith("__output"))
    .forEach(([key, type]) => {
      if (!nodesByCategory[type.category]) nodesByCategory[type.category] = {};
      nodesByCategory[type.category][key] = type;
    });

  return (
    <div className="border-t border-white/15 flex flex-col min-h-0 overflow-auto flex-1">
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
                          type: key,
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

      <div className="p-3 flex flex-col">
        <ShaderEditor trigger={<Button variant="outline">New Shader</Button>} />
      </div>
    </div>
  );
}
