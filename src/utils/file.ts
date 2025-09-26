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
