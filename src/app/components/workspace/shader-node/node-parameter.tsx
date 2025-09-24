import { useMemo } from "react";
import { NodeProps } from "@xyflow/react";

import { ShaderNode as ShaderNodeType, useNodeStore } from "@/store/node.store";
import { useAssetStore } from "@/store/asset.store";
import { NodeType } from "@/schemas/node.schema";
import { imageURLFromAsset } from "@/utils/image-url-from-asset";
import { Button } from "@/ui/button";
import { AssetManager } from "../asset-manager";

type ParameterProps = NodeProps<ShaderNodeType> & {
  name: string;
  param: NodeType["parameters"][string];
};

export function NodeParameter({ id, data, name, param }: ParameterProps) {
  const images = useAssetStore((s) => s.images);
  const setParameter = useNodeStore((s) => s.updateNodeParameter);

  const imageUrl = useMemo(() => {
    const imageName = data.parameters[name]?.value;
    return imageName && imageURLFromAsset(images[imageName]);
  }, [images, data.parameters, name]);

  if (param.type === "select") return "not implemented yet";

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
          className="col-start-1 col-span-2 justify-start pl-1 pt-1 pb-1 pr-2 mt-2 w-40"
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
