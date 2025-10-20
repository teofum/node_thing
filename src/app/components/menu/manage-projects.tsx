import { ComponentProps, useState } from "react";
import { LuCloudDownload, LuPencilLine, LuTrash2 } from "react-icons/lu";
import { useRouter } from "next/navigation";

import { Dialog, DialogClose } from "@/ui/dialog";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";

import { deleteProject, loadProjectOnline, updateProjectName } from "./actions";
import { Tables } from "@/lib/supabase/database.types";
import { importProject, ImportResult } from "@/utils/project";
import { ConfirmImport } from "./confirm-import";

type ManageProjectsProps = {
  trigger: ComponentProps<typeof Dialog>["trigger"];
  projects: Tables<"projects">[];
  open?: ComponentProps<typeof Dialog>["open"];
  onOpenChange?: ComponentProps<typeof Dialog>["onOpenChange"];
};

export function ManageProjects({
  trigger,
  projects,
  ...props
}: ManageProjectsProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nameDraft, setNameDraft] = useState<string>("");
  const [importResult, setImportResult] = useState<ImportResult>(undefined);

  const router = useRouter();

  async function handleRename(projectId: string) {
    await updateProjectName(projectId, nameDraft);
    setEditingId(null);
    router.refresh();
  }

  async function handleDelete(projectId: string) {
    await deleteProject(projectId);
    router.refresh();
  }

  const handleOpen = async (project: Tables<"projects">) => {
    const blob = await loadProjectOnline(project.user_project);

    const file = new File([blob], project.user_project, {
      type: blob.type,
    });

    setImportResult(await importProject(file));
  };

  return (
    <>
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
            projects.map((project) => (
              <div
                key={project.id}
                className="flex items-center min-h-0 min-w-0 justify-between mb-3 border border-white/15 rounded-md p-3"
              >
                {editingId === project.id ? (
                  <Input
                    value={nameDraft}
                    onChange={(e) => setNameDraft(e.target.value)}
                    onBlur={() => handleRename(project.id)}
                    autoFocus
                    className="w-full"
                  />
                ) : (
                  <div className="w-full">{project.name ?? "Untitled"}</div>
                )}

                <div className="flex gap-1">
                  <Button
                    icon
                    variant="ghost"
                    onClick={() => handleOpen(project)}
                  >
                    <LuCloudDownload />
                  </Button>

                  <Button
                    icon
                    variant="ghost"
                    onClick={() => {
                      setEditingId(project.id);
                      setNameDraft(project.name ?? "");
                    }}
                  >
                    <LuPencilLine />
                  </Button>

                  <Button
                    icon
                    className="text-red-400"
                    variant="ghost"
                    onClick={() => handleDelete(project.id)}
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
      <ConfirmImport
        importResult={importResult}
        setImportResult={setImportResult}
      />
    </>
  );
}
