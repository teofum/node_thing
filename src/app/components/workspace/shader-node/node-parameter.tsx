import { NodeProps } from "@xyflow/react";

import { ShaderNode as ShaderNodeType, useStore } from "@/store/store";
import { useAssetStore } from "@/store/asset-store";
import { NodeType } from "@/schemas/node.schema";
import { Select, SelectItem } from "@/ui/select";
import { imageURLFromAsset } from "@/utils/image-url-from-asset";

type ParameterProps = NodeProps<ShaderNodeType> & {
  name: string;
  param: NodeType["parameters"][string];
};

export function NodeParameter({ id, data, name, param }: ParameterProps) {
  const images = useAssetStore((s) => s.images);
  const setParameter = useStore((s) => s.updateNodeParameter);

  if (param.type === "select") return "not implemented yet";

  const image = data.parameters[name]?.value ?? "none";
  const setImage = (newValue: string) => {
    const value = newValue === "none" ? null : newValue;
    setParameter(id, name, value);
  };

  return (
    <Select
      variant="outline"
      className="w-full mt-2 !p-1 overflow-hidden"
      value={image}
      onValueChange={setImage}
    >
      {Object.entries(images).map(([name, asset]) => (
        <SelectItem key={name} value={name} className="!p-1">
          <div className="flex flex-row items-center gap-2">
            {/* We don't care about nextjs image optimization here, it's a local data url */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt=""
              className="aspect-square object-cover w-8 min-w-8 rounded"
              src={imageURLFromAsset(asset)}
            />
            <div>{name}</div>
          </div>
        </SelectItem>
      ))}

      <SelectItem value="none" className="!p-1">
        <div className="flex flex-row items-center gap-2">
          <div className="bg-pattern-squares bg-neutral-950 text-fuchsia-500 aspect-square object-cover w-8 min-w-8 rounded" />
          <div>No image</div>
        </div>
      </SelectItem>
    </Select>
  );
}
