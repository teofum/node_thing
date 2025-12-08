import { NodeProps } from "@xyflow/react";
import { useMemo } from "react";

import { NodeType, ShaderNode } from "@/schemas/node.schema";
import { useAssetStore } from "@/store/asset.store";
import { useProjectStore } from "@/store/project.store";
import { Button } from "@/ui/button";
import { imageURLFromAsset } from "@/utils/image-url-from-asset";
import { AssetManager } from "../asset-manager";
import { Select, SelectItem } from "@/ui/select";
import { Input } from "@/ui/input";

type ParameterProps = NodeProps<ShaderNode> & {
  name: string;
  param: NodeType["parameters"][string];
};

export function NodeParameter(props: ParameterProps) {
  switch (props.param.type) {
    case "image":
      return <ImageParameter {...props} />;
    case "select":
      return <SelectParameter {...props} />;
    case "string":
      return <StringParameter {...props} />;
  }
}

function SelectParameter({ id, data, name, param }: ParameterProps) {
  const setParameter = useProjectStore((s) => s.updateNodeParameter);

  if (param.type !== "select") return null;
  return (
    <div className="col-span-3 grid grid-cols-subgrid items-center mb-1.5">
      <div className="text-xs/4 min-w-4">{param.name}</div>
      <Select
        variant="outline"
        size="sm"
        className="col-span-2"
        value={data.parameters[name].value ?? "N/A"}
        onValueChange={(v) => setParameter(id, name, v)}
      >
        {param.options.map((option, i) => (
          <SelectItem size="sm" key={option} value={`${i}`}>
            {option}
          </SelectItem>
        ))}
      </Select>
    </div>
  );
}

function StringParameter({ id, data, name, param }: ParameterProps) {
  const setParameter = useProjectStore((s) => s.updateNodeParameter);

  return (
    <div className="col-span-3 grid grid-cols-subgrid items-center mb-1.5">
      <div className="text-xs/4 min-w-4">{param.name}</div>
      <Input
        variant="outline"
        size="sm"
        className="col-span-2"
        value={data.parameters[name].value ?? ""}
        onChange={(ev) => setParameter(id, name, ev.target.value)}
      />
    </div>
  );
}

function ImageParameter({ id, data, name }: ParameterProps) {
  const images = useAssetStore((s) => s.images);
  const setParameter = useProjectStore((s) => s.updateNodeParameter);

  const imageUrl = useMemo(() => {
    const imageName = data.parameters[name]?.value;
    return imageName && imageURLFromAsset(images[imageName]);
  }, [images, data.parameters, name]);

  const image = data.parameters[name]?.value ?? "No image";
  const setImage = (newValue: string) => {
    const value = newValue === "none" ? null : newValue;
    setParameter(id, name, value);
  };

  return (
    <AssetManager
      trigger={
        <Button
          variant="outline"
          className="col-start-1 col-span-3 justify-start pl-1 pt-1 pb-1 pr-2 mb-2 w-40"
        >
          {imageUrl ? (
            /* We don't care about nextjs image optimization here, it's a local data url */
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              alt=""
              className="aspect-square object-cover w-8 min-w-8 rounded"
              src={imageUrl}
            />
          ) : (
            <div className="aspect-square w-8 min-w-8 rounded bg-pattern-squares bg-neutral-950 text-fuchsia-500" />
          )}
          <div className="whitespace-nowrap overflow-hidden overflow-ellipsis">
            {image}
          </div>
        </Button>
      }
      onSelect={(name) => setImage(name)}
    />
  );
}
