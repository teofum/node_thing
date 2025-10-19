import JSZip from "jszip";

import { imageTypeSchema } from "@/schemas/asset.schema";
import { useAssetStore } from "@/store/asset.store";
import { useProjectStore } from "@/store/project.store";
import { openFile, saveFile } from "./file";
import { getImageType } from "./image";

export async function importProjectFromFile() {
  const file = await openFile(["application/zip"]);
  if (file) importProject(file);
}

export async function exportProjectFromFile() {
  const file = await exportProject();

  saveFile({
    suggestedName: "project.zip",
    types: [{ accept: { "application/zip": [".zip"] } }],
    data: file,
  });
}

export async function exportProject() {
  const project = useProjectStore.getState().exportProject();
  const images = useAssetStore.getState().images;

  const zip = new JSZip();
  zip.file("project.json", JSON.stringify(project));

  const imagesFolder = zip.folder("images");
  if (imagesFolder !== null) {
    for (const [name, asset] of Object.entries(images)) {
      imagesFolder.file(name, asset.data);
    }
  }

  return await zip.generateAsync({ type: "blob" });
}

export async function importProject(file: File) {
  const zip = await JSZip.loadAsync(file);

  useAssetStore.persist.clearStorage();
  useAssetStore.setState({ images: {} });

  const imageFiles = Object.keys(zip.files).filter(
    (f) => f.startsWith("images/") && !f.endsWith("/"),
  );

  for (const filename of imageFiles) {
    const fileObj = zip.file(filename);
    if (!fileObj) {
      console.warn(`Import: asset file ${filename} not found, skipping`);
      continue;
    }

    const arrayBuffer = await fileObj.async("arraybuffer");
    const data = new Uint8Array(arrayBuffer);

    const prefix = "images/";
    const name = filename.startsWith(prefix)
      ? filename.substring(prefix.length)
      : filename;

    const type = imageTypeSchema.parse(getImageType(name));
    useAssetStore.getState().addImage(name, { type, data });
  }

  const jsonFile = zip.file("project.json");
  if (!jsonFile) {
    throw new Error("project.json not found");
  }

  const json = await jsonFile.async("string");
  const project = JSON.parse(json);
  useProjectStore.getState().importProject(project);
}
