import { useEffect, useState } from "react";

import { useProjectStore } from "@/store/project.store";
import { useAssetStore } from "@/store/asset.store";
import { zip } from "@/utils/zip";

export function useTextureCache(device: GPUDevice | null) {
  const layers = useProjectStore((s) => s.layers);
  const images = useAssetStore((s) => s.images);

  const [textures, setTextures] = useState<[string, GPUTexture][]>([]);

  useEffect(() => {
    if (!device) return;

    const imageNamesArray = layers.flatMap((layer) =>
      layer.nodes
        .map((node) => node.data.parameters["image"]?.value ?? null)
        .filter((name) => name !== null),
    );
    const imageNames = [...new Set(imageNamesArray)]; // Deduplicate

    const cachedNames = textures.map(([name]) => name);

    const hasUpdates =
      imageNames.length !== cachedNames.length ||
      zip(imageNames, cachedNames).some(([image, cached]) => image !== cached);

    if (!hasUpdates) return;

    const createTexture = async (name: string) => {
      const asset = images[name];

      const blob = new Blob([asset.data], { type: `image/${asset.type}` });
      const imageBitmap = await createImageBitmap(blob, {
        colorSpaceConversion: "none",
      });

      const texture = device.createTexture({
        format: "rgba8unorm",
        size: [imageBitmap.width, imageBitmap.height],
        usage:
          GPUTextureUsage.TEXTURE_BINDING |
          GPUTextureUsage.COPY_DST |
          GPUTextureUsage.RENDER_ATTACHMENT,
      });

      device.queue.copyExternalImageToTexture(
        { source: imageBitmap, flipY: true },
        { texture },
        { width: imageBitmap.width, height: imageBitmap.height },
      );

      return texture;
    };

    const updateTextures = async () => {
      const newTextures = zip(
        imageNames.filter((name) => !cachedNames.includes(name)),
        await Promise.all(
          imageNames
            .filter((name) => !cachedNames.includes(name))
            .map((name) => createTexture(name)),
        ),
      );

      setTextures([
        ...textures.filter(([name]) => imageNames.includes(name)),
        ...newTextures,
      ] as [string, GPUTexture][]);
    };

    updateTextures();
  }, [device, layers, textures, images]);

  return textures;
}
