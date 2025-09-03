import { Canvas } from "./components/renderer/canvas";
import { Workspace } from "./components/workspace";

export default function Home() {
  return (
    // hago la estructura básica todo con divs

    // TODO arreglar fullscreen sin scroll

    // div general para definir el grid (de 3 columnas)
    <div className="font-sans grid grid-rows-[auto_auto_1fr] w-screen h-screen">
      {/* header */}
      <div className="flex justify-between items-center p-4">
        <h1 className="font-semibold tracking-wide">node_thing</h1>
      </div>

      {/* barra de herramientas */}
      <div className="p-4">
        <button className="bg-stone-800 px-2 py-1 rounded hover:bg-blue-700">
          Import
        </button>{" "}
        {/* TODO */}
        <button className="bg-stone-800 px-2 py-1 rounded hover:bg-blue-700">
          Export
        </button>{" "}
        {/* TODO */}
      </div>

      {/* panel principal (otro grid, de 2 columnas) */}
      <div className="grid grid-cols-[2fr_1fr] min-h-0">
        {/* panel central (workspace) */}
        <Workspace />

        {/* panel derecho */}
        <div className="border-l border-gray-600 p-1 min-w-0 min-h-0">
          <Canvas />
        </div>
      </div>
    </div>
  );
}
