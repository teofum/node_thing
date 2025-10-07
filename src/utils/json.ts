import { openFile, saveFile } from "./file";

export async function saveJsonToFile(json: string, suggestedName: string) {
  return await saveFile({
    suggestedName: `${suggestedName}.json`,
    types: [{ accept: { "application/json": [".json"] } }],
    data: json,
  });
}

export async function loadJsonFromFile(onload: (json: string) => void) {
  const file = await openFile(["application/json"]);
  if (file) {
    const json = await file.text();
    onload(json);
  }
}
