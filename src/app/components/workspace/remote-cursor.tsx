import { LuMousePointer2 } from "react-icons/lu";

export function RemoteCursor({
  x,
  y,
  name,
  color,
}: {
  x: number;
  y: number;
  name: string;
  color: string;
}) {
  return (
    <div
      className="pointer-events-none absolute z-50 transition-transform duration-100 ease-out"
      style={{
        transform: `translate(${x}px, ${y}px)`,
      }}
    >
      <LuMousePointer2 size={20} color={color} strokeWidth={2.5} />
      <div
        className="mt-1 ml-1 px-2 py-1 rounded text-xs font-medium text-white whitespace-nowrap shadow-lg"
        style={{ backgroundColor: color }}
      >
        {name}
      </div>
    </div>
  );
}
