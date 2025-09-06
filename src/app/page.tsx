import { Canvas } from "./components/renderer/canvas";
import { Workspace } from "./components/workspace";
import { AuthButton } from "./components/auth/auth-button";

export default function Home() {
  return (
    // hago la estructura básica todo con divs

    // TODO arreglar fullscreen sin scroll

    // div general para definir el grid (de 3 columnas)
    <div className="font-sans grid grid-rows-[auto_auto_1fr] w-screen h-screen bg-neutral-800">
      {/* header */}
      <div className="flex justify-between items-center p-4">
        <h1 className="font-semibold tracking-wide">node_thing</h1>
        <AuthButton />
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

      {/* Main panel */}
      <main className="flex flex-row min-h-0 max-w-full select-none">
        <Workspace />

        {/* Output panel */}
        <div className="p-1 relative min-h-0">
          <div className="absolute inset-2 rounded overflow-hidden z-20">
            <Canvas />
          </div>

          {/* CSS resize hack */}
          <div className="absolute left-0.5 top-1/2 -translate-y-1/2 h-4 w-1 rounded bg-neutral-600" />
          <div className="relative top-1/2 -translate-y-1/2 h-4 w-full resize-x min-w-80 max-w-[70vw] -ml-1.5 overflow-hidden [direction:rtl] opacity-0" />
        </div>
      </main>
    </div>
  );
}
