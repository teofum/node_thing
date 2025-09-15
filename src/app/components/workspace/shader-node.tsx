import { Handle, NodeProps, Position } from "@xyflow/react";
import { NODE_TYPES } from "@/utils/node-type";
import { ShaderNode as ShaderNodeType, useStore } from "@/store/store";
import cn from "classnames";
import { NodeType } from "@/schemas/node.schema";

const HANDLE_HEIGHT = 24;
const HEADER_HEIGHT = 16 + 2 * 8 + 1 + 8 + HANDLE_HEIGHT / 2;

type NodeInputProps = NodeProps<ShaderNodeType> & {
  input: [string, NodeType["inputs"][string]];
  i: number;
  mock?: boolean;
};

function NodeInput({
  data,
  id,
  input: [key, input],
  i,
  mock = false,
}: NodeInputProps) {
  const updateDefaultValue = useStore((s) => s.updateNodeDefaultValue);
  const edges = useStore((s) => s.layers[s.currentLayer].edges);

  const renderDefaultValueInput =
    !mock &&
    id !== "__output" &&
    !edges.some((edge) => edge.target === id && edge.targetHandle === key);

  return (
    <div className="flex flex-row gap-2 h-6 items-center">
      {mock ? (
        <div
          className={cn(
            "react-flow__handle react-flow__handle-left",
            "!border-neutral-600 !border",
            {
              "!bg-teal-500": input.type === "color",
              "!bg-neutral-100": input.type === "number",
            },
          )}
          style={{ top: i * HANDLE_HEIGHT + HEADER_HEIGHT }}
        />
      ) : (
        <Handle
          type="target"
          position={Position.Left}
          id={key}
          style={{ top: i * HANDLE_HEIGHT + HEADER_HEIGHT }}
          className={cn({ "!bg-teal-500": input.type === "color" })}
        />
      )}
      <div className="text-white text-xs/4">{input.name}</div>
      {renderDefaultValueInput ? (
        input.type === "number" ? (
          <input
            type="range"
            className="nodrag"
            min={0}
            max={1}
            step={0.01}
            defaultValue={data.defaultValues[key].toString()}
            onChange={(ev) =>
              updateDefaultValue(id, key, Number(ev.target.value))
            }
          />
        ) : (
          <input
            type="color"
            className="nodrag"
            defaultValue={`#${(data.defaultValues[key] as number[]).map((n) => (~~(n * 255)).toString(16).padStart(2, "0")).join("")}`}
            onChange={(ev) => {
              const color = ev.target.value;
              const r = parseInt(color.substring(1, 3), 16) / 255;
              const g = parseInt(color.substring(3, 5), 16) / 255;
              const b = parseInt(color.substring(5, 7), 16) / 255;
              updateDefaultValue(id, key, [r, g, b, 1]);
            }}
          />
        )
      ) : null}
    </div>
  );
}

// TODO, ShaderNode por ahora solamente recibe node: Node (el de node.shema.ts)
// puede que querramos guardar el código del shader en formato string dentro del objeto data:
export function RenderShaderNode(
  props: NodeProps<ShaderNodeType> & { mock?: boolean },
) {
  const { data, selected } = props;
  const nodeTypeInfo = NODE_TYPES[data.type];

  // TODO acá habría que renderizar y mostrar menú para cada atributo y demás
  const outputOffset =
    Object.keys(nodeTypeInfo.inputs).length * HANDLE_HEIGHT + HEADER_HEIGHT;

  const uploadImage = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = ev.target;
    if (!files?.length) return;

    const createImage = async () => {
      const image = await createImageBitmap(files[0], {
        colorSpaceConversion: "none",
      });
      console.log(image);
    };
    createImage();
  };

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
            "bg-orange-400/15": data.type === "__input",
          },
        )}
      >
        {nodeTypeInfo.name}
      </div>

      <div className="p-2">
        {/* inputs */}
        {Object.entries(nodeTypeInfo.inputs).map(([key, input], i) => (
          <NodeInput key={key} input={[key, input]} i={i} {...props} />
        ))}

        {/* outputs */}
        {Object.entries(nodeTypeInfo.outputs).map(([key, output], i) => (
          <div
            key={key}
            className="flex flex-row-reverse gap-2 h-6 items-center"
          >
            {props.mock ? (
              <div
                className={cn(
                  "react-flow__handle react-flow__handle-right",
                  "!border-neutral-600 !border",
                  {
                    "!bg-teal-500": output.type === "color",
                    "!bg-neutral-100": output.type === "number",
                  },
                )}
                style={{ top: i * HANDLE_HEIGHT + outputOffset }}
              />
            ) : (
              <Handle
                type="source"
                position={Position.Right}
                id={key}
                style={{ top: i * HANDLE_HEIGHT + outputOffset }}
                className={cn({ "!bg-teal-500": output.type === "color" })}
              />
            )}
            <div className="text-white text-xs/4 flex justify-end">
              {output.name}
            </div>
          </div>
        ))}

        {/* disgusting hardcoded garbage for testing get rid of this shit asap */}
        {data.type === "__input" ? (
          <input
            className="bg-teal-50 rounded-lg text-black p-2 mt-4 w-40 text-xs"
            type="file"
            accept="image/png, image/jpeg, image/webp"
            onChange={uploadImage}
          />
        ) : null}
      </div>
    </div>
  );
}
