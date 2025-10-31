"use client";

import { Tables } from "@/lib/supabase/database.types";
import { Button } from "@/ui/button";
import { useState } from "react";
import { PublishDialog } from "./publish-dialog";

type PublishMenuProps = {
  projects: Tables<"projects">[];
  shaders: Tables<"shaders">[];
  categories: Tables<"categories">[];
};

export default function PublishMenu({
  projects,
  shaders,
  categories,
}: PublishMenuProps) {
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [publishType, setPublishType] = useState<"shader" | "project">(
    "project",
  );
  const [publishId, setPublishId] = useState("");

  function publishShader(id: string) {
    setPublishType("shader");
    setPublishId(id);
    setPublishDialogOpen(true);
  }

  function publishProject(id: string) {
    setPublishType("project");
    setPublishId(id);
    setPublishDialogOpen(true);
  }

  return (
    <>
      <div className="min-h-screen bg-neutral-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Publish shader</h1>
          </div>
          <div className="glass glass-border rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Your shaders</h2>

            <div className="space-y-1 ">
              {shaders.length ? (
                shaders.map((shader) => (
                  <div
                    key={shader.id}
                    className="flex flex-row items-center min-h-0 min-w-0 justify-between mb-3 border border-white/15 rounded-md p-3"
                  >
                    {shader.title}

                    {shader.published ? (
                      <Button
                        type="submit"
                        variant="ghost"
                        size="sm"
                        icon
                        disabled
                      >
                        Publish
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        variant="ghost"
                        size="sm"
                        icon
                        onClick={() => publishShader(shader.id)}
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
          </div>

          <div className="mt-8 mb-8">
            <h1 className="text-3xl font-bold">Publish project</h1>
          </div>
          <div className="glass glass-border rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Your projects</h2>
            <div className="space-y-1 ">
              {/* TODO Juani mejor diseño */}
              {projects.length ? (
                projects.map((currProject) => (
                  <div
                    key={currProject.id}
                    className="flex flex-row items-center min-h-0 min-w-0 justify-between mb-3 border border-white/15 rounded-md p-3"
                  >
                    {currProject.name}

                    {currProject.published ? (
                      <Button
                        type="submit"
                        variant="ghost"
                        size="sm"
                        icon
                        disabled
                      >
                        Publish
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        variant="ghost"
                        size="sm"
                        icon
                        onClick={() => publishProject(currProject.id)}
                      >
                        Publish
                      </Button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-white/50 mt-2">No projects yet...</p>
              )}
            </div>
          </div>
        </div>
      </div>
      <PublishDialog
        trigger={null}
        open={publishDialogOpen}
        onOpenChange={setPublishDialogOpen}
        type={publishType}
        id={publishId}
        categories={categories}
      />
    </>
  );
}
