"use client";

import { Button } from "@/ui/button";
import { loadImageFromFile } from "@/utils/image";
import { uploadImageToBucket } from "../../../actions";

export function UploadImage({
  itemType,
  itemId,
}: {
  itemType: "shader" | "project";
  itemId: string;
}) {
  async function uploadImage() {
    const file = await loadImageFromFile();
    if (file) {
      await uploadImageToBucket(file, itemType, itemId);
    }
  }

  return <Button onClick={uploadImage}>Upload image</Button>;
}
