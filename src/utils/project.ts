import JSZip from "jszip";

import { imageTypeSchema } from "@/schemas/asset.schema";
import { useAssetStore } from "@/store/asset.store";
import { useProjectStore } from "@/store/project.store";
import { openFile, saveFile } from "./file";
import { getImageType } from "./image";
import { Project, ProjectDependencies } from "@/store/project.types";

export async function importProjectFromFile() {
  const file = await openFile(["application/zip"]);
  if (file) return importProject(file);
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
  const project = await getProject(zip);

  async function doImport() {
    useAssetStore.persist.clearStorage();
    useAssetStore.setState({ images: {} });

    for (const filename of getAssetFilenames(zip)) {
      try {
        const { name, asset } = await getAsset(zip, filename);
        useAssetStore.getState().addImage(name, asset);
      } catch {
        console.warn(`Import: asset file ${filename} not found, skipping`);
      }
    }

    useProjectStore.getState().importProject(project);
  }

  const missingDependencies = getMissingDependencies(project);
  if (missingDependencies.length) {
    // Return the array of missing deps and the import callback, so the caller
    // can decide what to do
    return { missingDependencies, doImport };
  } else {
    await doImport();
  }
}

export type ImportResult = Awaited<ReturnType<typeof importProject>>;

function getMissingDependencies(project: Project & ProjectDependencies) {
  const externalNodeTypes = useProjectStore.getState().nodeTypes.external;

  return project.externalDependencies.nodeTypes.filter(
    (dep) =>
      !Object.hasOwn(externalNodeTypes, dep.id) ||
      externalNodeTypes[dep.id].externalShaderId !== dep.externalId,
  );
}

function getAssetFilenames(zip: JSZip) {
  return Object.keys(zip.files).filter(
    (f) => f.startsWith("images/") && !f.endsWith("/"),
  );
}

async function getAsset(zip: JSZip, filename: string) {
  const fileObj = zip.file(filename);
  if (!fileObj) throw new Error("file not found");

  const arrayBuffer = await fileObj.async("arraybuffer");
  const data = new Uint8Array(arrayBuffer);

  const prefix = "images/";
  const name = filename.startsWith(prefix)
    ? filename.substring(prefix.length)
    : filename;

  const type = imageTypeSchema.parse(getImageType(name));
  return { name, asset: { type, data } };
}

async function getProject(zip: JSZip) {
  const jsonFile = zip.file("project.json");
  if (!jsonFile) {
    throw new Error("project.json not found");
  }

  const json = await jsonFile.async("string");
  const project = JSON.parse(json);

  // TODO add zod validation
  return project as Project & ProjectDependencies;
}
