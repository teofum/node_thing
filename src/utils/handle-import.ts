export function handleImport(importProject: (json: string) => void) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";

  input.onchange = async (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file === undefined) {
      return;
    }

    const json = await file.text();
    importProject(json); // TODO manejo de errores
  };

  input.click();
}
