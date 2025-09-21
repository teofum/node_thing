import { useMemo } from "react";
import { NodeProps } from "@xyflow/react";

import { ShaderNode as ShaderNodeType, useStore } from "@/store/store";
import { useAssetStore } from "@/store/asset-store";
import { NodeType } from "@/schemas/node.schema";
import { Select, SelectItem } from "@/ui/select";
import { imageURLFromAsset } from "@/utils/image-url-from-asset";
import { AssetManager } from "../asset-manager";
import { Button } from "@/ui/button";

type ParameterProps = NodeProps<ShaderNodeType> & {
  name: string;
  param: NodeType["parameters"][string];
};

export function NodeParameter({ id, data, name, param }: ParameterProps) {
  const images = useAssetStore((s) => s.images);
  const setParameter = useStore((s) => s.updateNodeParameter);

  const imageUrl = useMemo(() => {
    const imageName = data.parameters[name]?.value;
    return imageName && imageURLFromAsset(images[imageName]);
  }, [images, data.parameters, name]);

  if (param.type === "select") return "not implemented yet";

  const image = data.parameters[name]?.value ?? "Np image";
  const setImage = (newValue: string) => {
    const value = newValue === "none" ? null : newValue;
    setParameter(id, name, value);
  };

  return (
    <AssetManager
      trigger={
        <Button variant="outline" className="col-start-1 col-span-2">
          {/* We don't care about nextjs image optimization here, it's a local data url */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt=""
            className="aspect-square object-cover w-8 min-w-8 rounded"
            src={imageUrl ?? undefined}
          />
          <div>{image}</div>
        </Button>
      }
      onSelect={(name) => setImage(name)}
    />
  );
}
