import { useRef, useState } from "react";
import { LuUpload } from "react-icons/lu";
import Image from "next/image";

type Props = {
  onChange?: (file: File | null) => void;
  name?: string;
};

export function ImagePicker({ onChange, name }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const openFileDialog = () => {
    inputRef.current?.click();
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;

    if (!file) {
      return;
    }

    const url = URL.createObjectURL(file);
    setPreview((old) => {
      if (old) URL.revokeObjectURL(old);
      return url;
    });

    onChange?.(file);
  };

  return (
    <div
      className="group rounded-lg bg-white/5 w-[300px] h-[200px] cursor-pointer"
      onClick={openFileDialog}
    >
      <input
        name={name}
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />

      {preview ? (
        <Image
          src={preview}
          width={300}
          height={200}
          alt={`preview`}
          className="w-full aspect-[3/2] object-cover rounded-lg"
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-full">
          <LuUpload
            size={28}
            className="text-white bg-white/20 group-hover:bg-white/30 p-4 rounded-full w-15 h-15"
          />
        </div>
      )}
    </div>
  );
}
