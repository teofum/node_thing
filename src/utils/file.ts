export function openFile(acceptTypes: string[]) {
  return new Promise<File | null>((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = acceptTypes.join(", ");

    input.addEventListener("change", (ev) => {
      const { files } = ev.target as HTMLInputElement;
      resolve(files?.[0] ?? null);
    });

    input.click();
  });
}

type SaveFileOptions = {
  suggestedName: string;
  types: SaveFilePickerOptions["types"];
  data: FileSystemWriteChunkType;
};

export async function saveFile(options: SaveFileOptions) {
  const { suggestedName, types, data } = options;
  try {
    const handle = await window.showSaveFilePicker({
      suggestedName,
      types,
    });

    const writable = await handle.createWritable();
    await writable.write(data);
    await writable.close();
    return true;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_) {
    // TODO handle actual errors
    // By far the most common cause of throwing will be the user clicking cancel
    return false;
  }
}
