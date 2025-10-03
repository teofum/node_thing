import JSZip from "jszip";
import { saveFile, openFile } from "./file";
import { useMainStore } from "@/store/main.store";
import { useAssetStore } from "@/store/asset.store";
import { ImageAsset, imageTypeSchema } from "@/schemas/asset.schema";
import { getImageType } from "./image";

export function zip<T, U>(a: T[], b: U[]): [T, U][] {
  if (a.length !== b.length)
    throw new Error("arrays must have the same length");
  return a.map((el, i) => [el, b[i]]);
}

export async function zipExportProject() {
  const project = useMainStore.getState().exportProject();
  const images = useAssetStore.getState().images;

  // creo nuevo JSZip
  const zip = new JSZip();

  // cargo el JSON del proyecto
  zip.file("project.json", project);

  // cargo los assets (imágenes)
  const imagesFolder = zip.folder("images");
  if (imagesFolder !== null) {
    for (const [name, asset] of Object.entries(images)) {
      imagesFolder.file(name, asset.data);
    }
  }

  // genero el binario
  const blob = await zip.generateAsync({ type: "blob" });

  return blob;
}

export async function zipImportProjectFromFile() {
  // cargo archivo .zip
  const file = await openFile(["application/zip"]);
  if (!file) {
    return;
  }

  zipImportProject(file);
}

export async function zipImportProject(file: File) {
  const zip = await JSZip.loadAsync(file);

  // limpio persist (reinicia assets cargados, volar esto si se quieren mantener)
  // ahora mismo funciona importar un proyecto sobreescribe lo que estaba antes
  useAssetStore.persist.clearStorage();
  useAssetStore.setState({ images: {} });

  // cargo nombres de imágenes
  const imageFiles = Object.keys(zip.files).filter(
    (f) => f.startsWith("images/") && !f.endsWith("/"),
  );

  // preproceso y cargo imágenes
  for (const filename of imageFiles) {
    const fileObj = zip.file(filename);

    if (!fileObj) {
      continue;
    }

    const arrayBuffer = await fileObj.async("arraybuffer");
    const bytes = new Uint8Array(arrayBuffer);

    const prefix = "images/";
    const name = filename.startsWith(prefix)
      ? filename.substring(prefix.length)
      : filename;

    const type = imageTypeSchema.parse(getImageType(name));

    useAssetStore.getState().addImage(name, { type, data: bytes });
  }

  // cargo JSON (pongo esto acá por condición de carrera)
  const jsonFile = zip.file("project.json");
  if (!jsonFile) {
    throw new Error("project.json not found");
  }

  // import del JSON al store
  const json = await jsonFile.async("string");
  useMainStore.getState().importProject(json);
}
