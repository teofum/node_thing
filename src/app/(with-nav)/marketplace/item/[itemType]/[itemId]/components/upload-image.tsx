"use client";

import { loadImageFromFile } from "@/utils/image";
import { uploadImageToBucket } from "../../../actions";
import { LuPencil } from "react-icons/lu";

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

  return (
    <>
      <button
        type="button"
        onClick={uploadImage}
        className="flex items-center justify-center bg-white/20 hover:bg-white/30 p-4 rounded-full "
      >
        <LuPencil size={28} className="text-white" />
      </button>
    </>
  );
}
