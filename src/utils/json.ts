import { openFile } from "./file";

export async function saveJsonToFile(json: string, suggestedName: string) {
  try {
    const handle = await window.showSaveFilePicker({
      suggestedName: suggestedName + ".json",
      types: [{ accept: { "application/json": [".json"] } }],
    });

    const writable = await handle.createWritable();
    await writable.write(json);
    await writable.close();
  } catch (e) {
    console.warn(e);
  }
}

export async function loadJsonFromFile(onload: (json: string) => void) {
  const file = await openFile(["application/json"]);
  if (file) {
    const json = await file.text();
    onload(json);
  }
}
