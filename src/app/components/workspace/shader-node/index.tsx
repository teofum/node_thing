import { ReactNode } from "react";
import { NodeProps } from "@xyflow/react";
import cn from "classnames";
import { LuStar, LuTriangleAlert, LuX } from "react-icons/lu";

import { ShaderNode as ShaderNodeType } from "@/schemas/node.schema";
import { CustomShaderMenu } from "./custom-shader-menu";
import { NodeInput } from "./node-input";
import { NodeMenu } from "./node-menu";
import { NodeOutput } from "./node-output";
import { NodeParameter } from "./node-parameter";
import { useNodeTypes } from "@/utils/use-node-types";
import { Button } from "@/ui/button";
import { useProjectStore } from "@/store/project.store";

type ShaderNodeProps = NodeProps<ShaderNodeType> & {
  mock?: boolean;
};

function ShaderNodeContainer({
  selected,
  children,
}: ShaderNodeProps & { children?: ReactNode }) {
  return (
    <div
      className={cn("glass rounded-xl border min-w-32", {
        "border-white/15": !selected,
        "border-teal-400/40 outline-teal-400/20 outline-2": selected,
      })}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      {children}
    </div>
  );
}

export function RenderShaderNode(props: ShaderNodeProps) {
  const { data } = props;
  const nodeTypes = useNodeTypes();
  const remove = useProjectStore((s) => s.removeNode);

  const nodeTypeInfo = nodeTypes[data.type];
  if (!nodeTypeInfo)
    return (
      <ShaderNodeContainer {...props}>
        <div className="text-xs/5 px-3 py-1.5 font-bold border-b border-white/15 bg-clip-padding rounded-t-[11px] bg-red-500/40">
          <div className="flex items-center gap-1">
            <LuTriangleAlert />
            Error
          </div>
        </div>

        <div className="p-2 flex flex-col gap-2">
          <div className="font-bold text-sm/4 text-red-400">Missing node</div>

          <Button
            variant="outline"
            className="text-red-400"
            onClick={() => remove(props.id)}
          >
            <LuX />
            Remove
          </Button>
        </div>
      </ShaderNodeContainer>
    );

  return (
    <ShaderNodeContainer {...props}>
      <div
        className={cn(
          "text-xs/5 px-3 py-1.5 font-bold border-b border-white/15 bg-clip-padding rounded-t-[11px]",
          {
            "bg-purple-400/15":
              data.type === "__output" || nodeTypeInfo.category === "Group",
            "bg-orange-400/15": nodeTypeInfo.category === "Input",
            "bg-blue-400/15": nodeTypeInfo.category === "Math",
            "bg-pink-400/15": nodeTypeInfo.category === "Object",
            "bg-green-400/15": nodeTypeInfo.category === "Generate",
          },
        )}
      >
        <div className="flex items-center gap-1">
          {nodeTypeInfo.name}
          {nodeTypeInfo.externalShaderId &&
          nodeTypeInfo.category !== "Custom" ? (
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
    </ShaderNodeContainer>
  );
}
