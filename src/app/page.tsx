import { Canvas } from "./components/canvas";
import { Workspace } from "./components/workspace";
import { AuthButton } from "@/components/auth/auth-button";

export default function Home() {
  return (
    // hago la estructura básica todo con divs

    // div general para definir el grid (de 3 columnas)
    <div className="font-sans grid grid-rows-[auto_auto_1fr] min-h-screen pb-20">
      {/* header */}
      <div className="flex justify-between items-center border p-4">
        <div className="flex items-center gap-4">
          <span className="font-bold">NODE THING</span>
          <Canvas />
        </div>
        <AuthButton />
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
        <div className="border p-4">PANEL DER</div>
      </div>
    </div>
  );
}
