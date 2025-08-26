import { Canvas } from "./components/canvas";
import { Workspace } from "./components/workspace";

export default function Home() {
  return (

    // hago la estructura básica todo con divs

    // div general para definir el grid (de 3 columnas)
    <div className="font-sans grid grid-rows-[auto_auto_1fr] min-h-screen pb-20">

      {/* header */}
      <div className="flex border p-4">
        HEADER
      </div> 

      {/* barra de herramientas */}
      <div className="border p-4">
        BARRA DE HERRAMIENTAS
      </div>

      {/* panel principal (otro grid, de 3 columnas) */}
      <div className="grid grid-cols-[15%_auto_20%]">

        {/* panel izquierdo (drag & drop) */}
        <div className="border p-4">
          PANEL IZQ
        </div>

        {/* panel central (workspace) */}
        <div className="border p-4">
          <Canvas />
          <Workspace />
          ...
        </div>

        {/* panel derecho */}
        <div className="border p-4">
          PANEL DER
        </div>
      </div>
      
    </div>
  );
}
