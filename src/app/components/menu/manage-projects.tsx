import { ComponentProps, useState } from "react";
import { LuCloudDownload, LuPencilLine, LuTrash2 } from "react-icons/lu";

import { Dialog, DialogClose } from "@/ui/dialog";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";

import { deleteProject, updateProjectName } from "./actions";
import { Tables } from "@/lib/supabase/database.types";
import { zipImportProject } from "@/utils/zip";

type ManageProjectsProps = {
  trigger: ComponentProps<typeof Dialog>["trigger"];
  projects: Tables<"projects">[];
  files: { name: string; blob: Blob }[];
  open?: ComponentProps<typeof Dialog>["open"];
  onOpenChange?: ComponentProps<typeof Dialog>["onOpenChange"];
};

export function ManageProjects({
  trigger,
  projects,
  files,
  ...props
}: ManageProjectsProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nameDraft, setNameDraft] = useState<string>("");

  async function handleRename(projectId: string) {
    await updateProjectName(projectId, nameDraft);
    setEditingId(null);
  }

  async function handleDelete(projectId: string) {
    await deleteProject(projectId);
  }

  return (
    <Dialog
      trigger={trigger}
      title="Project Manager"
      description="Manage projects lol"
      className="w-3/5"
      {...props}
    >
      <div className="h-full min-h-0 overflow-auto p-4 border-white/15">
        <div className="font-semibold text-xl mb-4">Projects</div>

        {projects.length ? (
          projects.map((currProject) => (
            <div
              key={currProject.id}
              className="flex items-center min-h-0 min-w-0 justify-between mb-3 border border-white/15 rounded-md p-3"
            >
              {editingId === currProject.id ? (
                <Input
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  onBlur={() => handleRename(currProject.id)}
                  autoFocus
                  className="w-full"
                />
              ) : (
                <div className="w-full">{currProject.name ?? "Untitled"}</div>
              )}

              <div className="flex gap-1">
                <Button
                  icon
                  variant="ghost"
                  onClick={async () => {
                    const fileData = files.find(
                      (f) => f.name === currProject.user_project,
                    );
                    if (!fileData) {
                      return;
                    }

                    const file = new File([fileData.blob], fileData.name);
                    await zipImportProject(file);
                  }}
                >
                  <LuCloudDownload />
                </Button>

                <Button
                  icon
                  variant="ghost"
                  onClick={() => {
                    setEditingId(currProject.id);
                    setNameDraft(currProject.name ?? "");
                  }}
                >
                  <LuPencilLine />
                </Button>

                <Button
                  icon
                  className="text-red-400"
                  variant="ghost"
                  onClick={() => handleDelete(currProject.id)}
                >
                  <LuTrash2 />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-white/50 mt-2">No projects yet...</p>
        )}
      </div>

      <div className="p-3 flex justify-end gap-2">
        <DialogClose asChild>
          <Button variant="outline">Close</Button>
        </DialogClose>
      </div>
    </Dialog>
  );
}
