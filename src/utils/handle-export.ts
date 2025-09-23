export async function handleExport(json: string, suggestedName: string) {
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
