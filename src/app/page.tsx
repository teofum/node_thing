import { Canvas } from "./components/canvas";
import { Workspace } from "./components/workspace";
import { Tester } from "./tester";

export default function Home() {
  return (
    // hago la estructura básica todo con divs

    // div general para definir el grid (de 3 columnas)
    <div className="font-sans grid grid-rows-[auto_auto_1fr] min-h-screen pb-20">
      {/* header */}
      <div className="flex border p-4">
        HEADER
        <Tester />
      </div>

      {/* barra de herramientas */}
      <div className="border p-4">BARRA DE HERRAMIENTAS</div>

      {/* panel principal (otro grid, de 2 columnas) */}
      <div className="grid grid-cols-[auto_20%]">
        {/* panel central (workspace) */}
        <div className="border p-4">
          <Workspace />
        </div>

        {/* panel derecho */}
        <div className="border p-4">
          PANEL DER
          <Canvas />
        </div>
      </div>
    </div>
  );
}
