import { LuHeart } from "react-icons/lu";

export function ContributeButton() {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <button className="px-3 py-1.5 rounded-md border border-white/15 hover:bg-white/5 transition-colors text-sm font-medium flex items-center gap-2 cursor-pointer">
          <LuHeart size={16} />
          Contribute
        </button>
      </div>
    </div>
  );
}
