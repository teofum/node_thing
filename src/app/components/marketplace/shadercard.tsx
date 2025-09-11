import { LuCirclePlus } from "react-icons/lu";

type ShaderCardProps = {
  title: string;
  price: number;
};

export default function ShaderCard({ title, price }: ShaderCardProps) {
  return (
    <div className="glass glass-border p-6 rounded-2xl">
      <h3 className="text-xl font-semibold text-white mb-4">{title}</h3>
      <h3 className="text-2xl font-bold text-teal-400">${price}</h3>
      <button
        className="absolute bottom-4 right-4 flex items-center justify-center 
                   w-8 h-8 rounded-md bg-purple-600 hover:bg-purple-500 
                   transition-colors shadow-md"
      >
        <LuCirclePlus className="text-white w-5 h-5" />
      </button>
    </div>
  );
}
/*
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {shaders.map((shader) => (
                <div
                  key={shader.id}
                  className="glass glass-border p-6 rounded-2xl"
                >
                  <h3 className="text-xl font-semibold text-white mb-4">
                    {shader.title}
                  </h3>
                  <div className="text-2xl font-bold text-teal-400">
                    ${shader.price}
                  </div>
                </div>
              ))}
            </div> */
