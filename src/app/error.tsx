"use client";

import { Button } from "@/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex justify-center p-6">
      <div className="border border-white/15 bg-white/5 rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-semibold text-white mb-4">
          Something went wrong
        </h2>

        <div className="text-sm bg-black/30 p-3 rounded-lg border border-white/10">
          {error.name}: {error?.message}
        </div>

        <Button
          variant="default"
          onClick={() => reset()}
          className="w-full mt-2"
        >
          Try again
        </Button>
      </div>
    </div>
  );
}
