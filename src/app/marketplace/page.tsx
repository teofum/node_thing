import { LinkButton } from "@/ui/button";
import { LuArrowLeft } from "react-icons/lu";

export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-neutral-900 relative">
      <LinkButton variant="ghost" href="/" className="absolute top-4 left-4">
        <LuArrowLeft />
        Back
      </LinkButton>

      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Shader Marketplace
              </h1>
              <p className="text-neutral-400 mt-2">
                Discover and share amazing shaders
              </p>
            </div>
            <LinkButton href="/marketplace/upload">Upload Shader</LinkButton>
          </div>

          <div className="text-center py-12">
            <p className="text-neutral-400">nothing here yet :/</p>
          </div>
        </div>
      </div>
    </div>
  );
}
