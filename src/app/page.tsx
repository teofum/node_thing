import { Canvas } from "./components/canvas";
import { Workspace } from "./components/workspace";
import { Tester } from "./tester";

export default function Home() {
  return (
    // hago la estructura básica todo con divs

    // div general para definir el grid (de 3 columnas)
    <div className="font-sans grid grid-rows-[auto_auto_1fr] min-h-screen">
      {/* header */}
      <div className="flex justify-between items-center p-4">
        <h1 className="font-semibold tracking-wide">node_thing</h1>
        <button className="bg-stone-800 px-2 py-1 rounded hover:bg-blue-700">
          Login
        </button>{" "}
        {/* TODO */}
      </div>

      <hr className="border-gray-600" />

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

      <hr className="border-gray-600" />

      {/* panel principal (otro grid, de 2 columnas) */}
      <div className="grid grid-cols-[auto_20%]">
        {/* panel central (workspace) */}
        <div className="">
          <Workspace />
        </div>

        {/* panel derecho */}
        <div className="border-l border-gray-600 p-1">
          <Canvas />
          <Tester />
        </div>
      </div>
    </div>
  );
}
