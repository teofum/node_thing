import { NodeProps } from "@xyflow/react";
import cn from "classnames";
import { LuStar } from "react-icons/lu";

import { ShaderNode as ShaderNodeType } from "@/schemas/node.schema";
import { useProjectStore } from "@/store/project.store";
import { CustomShaderMenu } from "./custom-shader-menu";
import { NodeInput } from "./node-input";
import { NodeMenu } from "./node-menu";
import { NodeOutput } from "./node-output";
import { NodeParameter } from "./node-parameter";

export function RenderShaderNode(
  props: NodeProps<ShaderNodeType> & { mock?: boolean },
) {
  const { data, selected } = props;
  const nodeTypes = useProjectStore((state) => state.nodeTypes);

  const nodeTypeInfo = nodeTypes[data.type];
  if (!nodeTypeInfo) return null;

  return (
    <div
      className={cn("glass rounded-xl border min-w-32", {
        "border-white/20": !selected,
        "border-teal-400/40 outline-teal-400/20 outline-2": selected,
      })}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <div
        className={cn(
          "text-xs/5 px-3 py-1.5 font-bold border-b border-white/15 bg-clip-padding rounded-t-[11px]",
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

      <div className="p-2 grid grid-cols-[auto_auto_auto] gap-x-2">
        {/* parameters */}
        {!props.mock
          ? Object.entries(nodeTypeInfo.parameters).map(([key, param]) => (
              <NodeParameter key={key} name={key} param={param} {...props} />
            ))
          : null}

        {/* inputs */}
        {Object.entries(nodeTypeInfo.inputs).map(([key, input]) => (
          <NodeInput key={key} input={[key, input]} {...props} />
        ))}

        {/* outputs */}
        {Object.entries(nodeTypeInfo.outputs).map(([key, output]) => (
          <NodeOutput key={key} output={[key, output]} {...props} />
        ))}
      </div>
    </div>
  );
}
