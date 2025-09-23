import { LinkButton } from "@/ui/button";

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-neutral-900">
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">Done!</h1>
            <p className="text-neutral-400">
              Your purchase has been completed.
            </p>
          </div>

          <div className="space-y-3">
            <LinkButton href="/marketplace" className="w-full">
              Buy more shaders
            </LinkButton>
            <LinkButton href="/" variant="outline" className="w-full">
              Back to editor
            </LinkButton>
          </div>
        </div>
      </div>
    </div>
  );
}
