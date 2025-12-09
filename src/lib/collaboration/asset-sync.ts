import { createClient } from "@/lib/supabase/client";
import { ImageAsset } from "@/schemas/asset.schema";

export async function uploadAsset(
  roomId: string,
  name: string,
  data: ImageAsset,
): Promise<void> {
  const supabase = createClient();
  const blob = new Blob([data.data], { type: `image/${data.type}` });

  await supabase.storage
    .from("assets")
    .upload(`${roomId}/${name}`, blob, { upsert: true });
}

export async function downloadAsset(
  roomId: string,
  name: string,
): Promise<ImageAsset | null> {
  const supabase = createClient();

  const { data, error } = await supabase.storage
    .from("assets")
    .download(`${roomId}/${name}`);

  if (error || !data) return null;

  const arrayBuffer = await data.arrayBuffer();
  const type = data.type.split("/")[1] as ImageAsset["type"];

  return { type, data: new Uint8Array(arrayBuffer) };
}
