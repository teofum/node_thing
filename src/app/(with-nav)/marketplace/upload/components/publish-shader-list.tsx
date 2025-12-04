import { Tables } from "@/lib/supabase/database.types";
import { Button } from "@/ui/button";
import { forwardRef } from "react";

type PublishShaderListProps = {
  shaders: Tables<"shaders">[];
  handleView: (type: "shader" | "project", id: string) => void;
  publish: (id: string) => void;
} & React.HTMLAttributes<HTMLDivElement>;

export const PublishShaderList = forwardRef<
  HTMLDivElement,
  PublishShaderListProps
>(({ shaders, handleView, publish, ...props }, forwardedRef) => {
  return (
    <div className="space-y-1" ref={forwardedRef} {...props}>
      {shaders.length ? (
        shaders.map((shader) => (
          <div
            key={shader.id}
            className="flex flex-row items-center min-h-0 min-w-0 justify-between mb-3 border border-white/15 rounded-md p-3"
          >
            {shader.title}

            {shader.published ? (
              <Button
                onClick={() => handleView("shader", shader.id)}
                type="submit"
                variant="ghost"
                size="sm"
                icon
              >
                View post
              </Button>
            ) : (
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                icon
                onClick={() => publish(shader.id)}
              >
                Publish
              </Button>
            )}
          </div>
        ))
      ) : (
        <p className="text-sm text-white/50 mt-2">No shaders yet...</p>
      )}
    </div>
  );
});
PublishShaderList.displayName = "Publish shader list";
