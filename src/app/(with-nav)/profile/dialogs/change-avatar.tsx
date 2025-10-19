"use client";

import { Dialog, DialogClose } from "@/ui/dialog";
import { ReactNode, useCallback, useRef, useState } from "react";
import { Button } from "@/ui/button";
import { uploadAvatar, removeAvatar } from "../actions/settings";
import Image from "next/image";
import Cropper, { type Area } from "react-easy-crop";

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new window.Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.src = url;
  });

type AvatarEditorProps = {
  trigger: ReactNode;
  currentAvatarUrl: string;
};

export default function AvatarEditor({
  trigger,
  currentAvatarUrl,
}: AvatarEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const createCroppedImage = async (): Promise<Blob> => {
    if (!imageSrc || !croppedAreaPixels) throw new Error("No image to crop");

    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) throw new Error("No 2d context");

    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;

    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to create blob"));
        }
      }, "image/jpeg");
    });
  };

  return (
    <Dialog trigger={trigger} title="Change Avatar" description="">
      <div className="flex flex-col p-4 text-lg">
        {!imageSrc ? (
          <>
            <div className="flex flex-col items-center gap-4">
              <div className="w-[120px] h-[120px] rounded-full overflow-hidden">
                <Image
                  src={currentAvatarUrl}
                  alt="Avatar preview"
                  width={120}
                  height={120}
                  unoptimized
                  className="w-full h-full object-cover"
                />
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setImageSrc(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </div>
            <div className="flex justify-between items-center mt-4">
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    await removeAvatar();
                    window.location.reload();
                  } catch (err) {
                    setError(
                      err instanceof Error
                        ? err.message
                        : "Failed to remove avatar",
                    );
                  }
                }}
              >
                Remove
              </Button>
              <Button onClick={() => fileInputRef.current?.click()}>
                Choose Image
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="relative w-full h-[300px] bg-black">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Zoom:</span>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1"
              />
            </div>
          </div>
        )}
        {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
        {imageSrc && (
          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setImageSrc(null);
                setCrop({ x: 0, y: 0 });
                setZoom(1);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
            >
              Back
            </Button>
            <Button
              onClick={async () => {
                try {
                  const croppedBlob = await createCroppedImage();
                  const formData = new FormData();
                  formData.append("avatar", croppedBlob, "avatar.jpg");
                  await uploadAvatar(formData);
                  window.location.reload();
                } catch (err) {
                  setError(
                    err instanceof Error
                      ? err.message
                      : "Failed to upload avatar",
                  );
                }
              }}
            >
              Save
            </Button>
          </div>
        )}
      </div>
    </Dialog>
  );
}
