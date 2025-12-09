import { Tables } from "@/lib/supabase/database.types";
import { Button } from "@/ui/button";
import { Tooltip } from "@/ui/tooltip";
import { forwardRef } from "react";
import { LuUpload } from "react-icons/lu";
import PeekCodeDialog from "./peek-code-dialog";

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
    <div
      className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(20rem,1fr))]"
      ref={forwardedRef}
      {...props}
    >
      {shaders.length ? (
        shaders.map((shader) => (
          <div key={shader.id} className="glass glass-border p-4 rounded-2xl">
            <div className="flex">
              <h3 className="text-xl font-semibold mb-2">{shader.title}</h3>
              {shader.published && (
                <Tooltip
                  content={"This shader has already been published"}
                  delay={100}
                >
                  <LuUpload className="ml-auto" />
                </Tooltip>
              )}
            </div>

            <div className="flex">
              <PeekCodeDialog
                trigger={
                  <Button type="submit" variant="outline" size="md" icon>
                    See code
                  </Button>
                }
                title={shader.title}
                code={shader.code}
              />
              <div className="ml-auto text-teal-300">
                {shader.published ? (
                  <Button
                    onClick={() => handleView("shader", shader.id)}
                    type="submit"
                    variant="ghost"
                    size="md"
                    icon
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
                  >
                    Publish
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))
      ) : (
        <p className="text-sm text-white/50 mt-2">No shaders yet...</p>
      )}
    </div>
  );
});
PublishShaderList.displayName = "Publish shader list";
