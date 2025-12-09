import { Tables } from "@/lib/supabase/database.types";
import { Button } from "@/ui/button";
import { Tooltip } from "@/ui/tooltip";
import { forwardRef } from "react";
import { LuUpload } from "react-icons/lu";

type PublishProjectListProps = {
  projects: Tables<"projects">[];
  handleView: (type: "project" | "project", id: string) => void;
  publish: (id: string) => void;
} & React.HTMLAttributes<HTMLDivElement>;

export const PublishProjectList = forwardRef<
  HTMLDivElement,
  PublishProjectListProps
>(({ projects, handleView, publish, ...props }, forwardedRef) => {
  projects.sort((a, b) => {
    if (a.published === b.published) return 0;
    return a.published ? 1 : -1;
  });
  return (
    <div
      className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(20rem,1fr))]"
      ref={forwardedRef}
      {...props}
    >
      {projects.length ? (
        projects.map((project) => (
          <div key={project.id} className="glass glass-border p-4 rounded-2xl">
            <div className="flex">
              <h3 className="text-xl font-semibold mb-2">{project.name}</h3>
              {project.published && (
                <Tooltip
                  content={"This project has already been published"}
                  delay={100}
                >
                  <LuUpload className="ml-auto" />
                </Tooltip>
              )}
            </div>

            <div className="flex">
              <div className="ml-auto text-teal-300">
                {project.published ? (
                  <Button
                    onClick={() => handleView("project", project.id)}
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
                    onClick={() => publish(project.id)}
                  >
                    Publish
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))
      ) : (
        <p className="text-sm text-white/50 mt-2">No projects yet...</p>
      )}
    </div>
  );
});
PublishProjectList.displayName = "Publish project list";
