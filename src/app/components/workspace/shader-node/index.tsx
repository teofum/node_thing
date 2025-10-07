import { NodeProps } from "@xyflow/react";
import cn from "classnames";
import { LuStar } from "react-icons/lu";

import { ShaderNode as ShaderNodeType } from "@/schemas/node.schema";
import { useMainStore } from "@/store/main.store";
import { HANDLE_HEIGHT, HEADER_HEIGHT } from "./constants";
import { CustomShaderMenu } from "./custom-shader-menu";
import { NodeInput } from "./node-input";
import { NodeMenu } from "./node-menu";
import { NodeOutput } from "./node-output";
import { NodeParameter } from "./node-parameter";

export function RenderShaderNode(
  props: NodeProps<ShaderNodeType> & { mock?: boolean },
) {
  const { data, selected } = props;
  const nodeTypes = useMainStore((state) => state.nodeTypes);

  const nodeTypeInfo = nodeTypes[data.type];
  if (!nodeTypeInfo) return null;

  const outputOffset =
    Object.keys(nodeTypeInfo.inputs).length * HANDLE_HEIGHT + HEADER_HEIGHT;

  return (
    <div
      className={cn("glass rounded-lg border min-w-32", {
        "border-white/20": !selected,
        "border-teal-400/40 outline-teal-400/20 outline-2": selected,
      })}
    >
      <div
        className={cn(
          "text-xs/4 px-3 py-2 font-bold border-b border-white/15 bg-clip-padding rounded-t-[7px]",
          {
            "bg-purple-400/15": data.type === "__output",
            "bg-orange-400/15": nodeTypeInfo.category === "Input",
            "bg-blue-400/15": nodeTypeInfo.category === "Math",
          },
        )}
      >
        <div className="flex items-center gap-1">
          {nodeTypeInfo.name}
          {nodeTypeInfo.isPurchased ? (
            <LuStar className="w-3 h-3 opacity-70" />
          ) : null}
          <NodeMenu {...props} />
          <CustomShaderMenu {...props} />
        </div>
      </div>

      <div className="p-2">
        {/* inputs */}
        {Object.entries(nodeTypeInfo.inputs).map(([key, input], i) => (
          <NodeInput key={key} input={[key, input]} i={i} {...props} />
        ))}

        {/* outputs */}
        {Object.entries(nodeTypeInfo.outputs).map(([key, output], i) => (
          <NodeOutput
            key={key}
            output={[key, output]}
            i={i}
            offset={outputOffset}
            {...props}
          />
        ))}

        {/* parameters */}
        {!props.mock
          ? Object.entries(nodeTypeInfo.parameters).map(([key, param]) => (
              <NodeParameter key={key} name={key} param={param} {...props} />
            ))
          : null}
      </div>
    </div>
  );
}
