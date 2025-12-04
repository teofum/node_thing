import { Tables } from "@/lib/supabase/database.types";
import { Button } from "@/ui/button";
import { forwardRef } from "react";
import { LuUpload } from "react-icons/lu";

type PublishShaderListProps = {
  shaders: Tables<"shaders">[];
  handleView: (type: "shader" | "project", id: string) => void;
  publish: (id: string) => void;
} & React.HTMLAttributes<HTMLDivElement>;

export const PublishShaderList = forwardRef<
  HTMLDivElement,
  PublishShaderListProps
>(({ shaders, handleView, publish, ...props }, forwardedRef) => {
  shaders.sort((a, b) => {
    if (a.published === b.published) return 0;
    return a.published ? 1 : -1;
  });
  return (
    <div className="flex gap-4 space-y-1" ref={forwardedRef} {...props}>
      {shaders.length ? (
        shaders.map((shader) => (
          <div
            key={shader.id}
            className="glass glass-border p-4 rounded-2xl w-xs"
          >
            <div className="flex">
              <h3 className="text-xl font-semibold mb-2">{shader.title}</h3>
              {shader.published && <LuUpload className="ml-auto" />}
            </div>

            {shader.published ? (
              <Button
                onClick={() => handleView("shader", shader.id)}
                type="submit"
                variant="ghost"
                size="md"
                icon
                className="ml-auto"
              >
                View post
              </Button>
            ) : (
              <Button
                type="submit"
                variant="ghost"
                size="md"
                icon
                onClick={() => publish(shader.id)}
                className="ml-auto"
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
