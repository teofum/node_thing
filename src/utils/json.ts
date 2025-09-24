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

export function loadJsonFromFile(onload: (json: string) => void) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";

  input.onchange = async (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file === undefined) {
      return;
    }

    const json = await file.text();
    onload(json); // TODO manejo de errores
  };

  input.click();
}
