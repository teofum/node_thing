import * as Accordion from "@radix-ui/react-accordion";
import { Fragment } from "react";
import { LuFilePlus2 } from "react-icons/lu";

import { NodeType } from "@/schemas/node.schema";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/ui/accordion";
import { Button } from "@/ui/button";
import { useNodeTypes } from "@/utils/use-node-types";
import { ShaderEditor } from "./shader-editor";
import { RenderShaderNode } from "./shader-node";
import { Tooltip } from "@/ui/tooltip";

type ShaderListProps = {
  nodeKey: string;
  nodeTypes: Record<string, NodeType>;
  onDragStart: (event: React.DragEvent, nodeType: string) => void;
};

const ShaderList = ({ nodeKey, nodeTypes, onDragStart }: ShaderListProps) => {
  return (
    <Tooltip
      className="text-[15px] max-w-70 max-h-70"
      content={nodeTypes[nodeKey].tooltip ?? "(Missing description)"}
      side="right"
      delay={600}
    >
      <div
        className="cursor-grab"
        onDragStart={(event) => onDragStart(event, nodeKey)}
        draggable
      >
        <RenderShaderNode
          mock
          id={nodeKey}
          data={{
            type: nodeKey,
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
    </Tooltip>
  );
};

export function MenuLibrary() {
  const nodeTypes = useNodeTypes();

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
    <div className="border-t border-white/15 flex flex-col h-full">
      <div className="grow overflow-auto min-h-0 border-b border-white/15">
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
                      <ShaderList
                        key={key}
                        nodeKey={key}
                        nodeTypes={nodeTypes}
                        onDragStart={onDragStart}
                      />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Fragment>
          ))}
        </Accordion.Root>
      </div>

      <div className="p-2 flex flex-col gap-2">
        <ShaderEditor
          trigger={
            <Button variant="outline">
              <LuFilePlus2 />
              New Shader
            </Button>
          }
        />
      </div>
    </div>
  );
}
