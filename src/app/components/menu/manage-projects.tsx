import {
  ComponentProps,
  startTransition,
  useActionState,
  useState,
} from "react";
import {
  LuCloudDownload,
  LuPencilLine,
  LuStar,
  LuTrash2,
} from "react-icons/lu";

import { Dialog } from "@/ui/dialog";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";

import { deleteProject, loadProjectOnline, updateProjectName } from "./actions";
import { Tables } from "@/lib/supabase/database.types";
import { importProject, ImportResult } from "@/utils/project";
import { ConfirmImport } from "./confirm-import";

type ManageProjectsProps = {
  trigger: ComponentProps<typeof Dialog>["trigger"];
  projects: Tables<"projects">[];
  purchasedProjects: Tables<"projects">[];
  open?: ComponentProps<typeof Dialog>["open"];
  onOpenChange?: ComponentProps<typeof Dialog>["onOpenChange"];
};

export function ManageProjects({
  trigger,
  projects,
  purchasedProjects,
  ...props
}: ManageProjectsProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nameDraft, setNameDraft] = useState<string>("");
  const [importResult, setImportResult] = useState<ImportResult>(undefined);

  // TODO pending behaviour
  const [handleRenameState, handleRenameAction, handleRenamePending] =
    useActionState(async (_1: null, projectId: string) => {
      await updateProjectName(projectId, nameDraft);
      setEditingId(null);
      return null;
    }, null);

  // TODO pending behaviour
  const [handleDeleteState, handleDeleteAction, handleDeletePending] =
    useActionState(async (_1: null, projectId: string) => {
      await deleteProject(projectId);
      return null;
    }, null);

  // TODO pending behaviour
  const [handleOpenState, handleOpenAction, handleOpenPending] = useActionState(
    async (_1: null, project: Tables<"projects">) => {
      const blob = await loadProjectOnline(project.user_project);
      const file = new File([blob], project.user_project, {
        type: blob.type,
      });

      setImportResult(await importProject(file));
      return null;
    },
    null,
  );

  const allProjects = [
    ...projects.map((p) => ({ ...p, isPurchased: false })),
    ...purchasedProjects.map((p) => ({ ...p, isPurchased: true })),
  ];

  return (
    <>
      <Dialog
        trigger={trigger}
        title="Project Manager"
        description="Click a project to open it"
        className="w-2/5"
        {...props}
      >
        <div className="h-full min-h-0 overflow-auto p-4 border-white/15">
          {allProjects.length ? (
            allProjects.map((project) => (
              <div
                key={project.id}
                className="flex items-center min-h-0 min-w-0 justify-between mb-3 border border-white/15 rounded-md p-3 hover:bg-current/10 disabled:bg-current/10 active:bg-current/15 disabled:active:bg-current/10"
              >
                {editingId === project.id ? (
                  <Input
                    value={nameDraft}
                    onChange={(e) => setNameDraft(e.target.value)}
                    onBlur={() =>
                      startTransition(() => handleRenameAction(project.id))
                    }
                    autoFocus
                    className="w-full"
                  />
                ) : (
                  <div className="flex flex-col">
                    <div className="w-full font-semibold">
                      {project.name ?? "Untitled"}
                    </div>

                    <p className="text-xs text-white/60 text-left min-h-4">
                      {project.description}
                    </p>
                  </div>
                )}

                <div className="flex gap-1">
                  {project.isPurchased && (
                    <Button
                      icon
                      variant="ghost"
                      onClick={() =>
                        startTransition(() => handleOpenAction(project))
                      }
                    >
                      <LuStar className="opacity-70" />
                    </Button>
                  )}
                  <Button
                    icon
                    variant="ghost"
                    onClick={() =>
                      startTransition(() => handleOpenAction(project))
                    }
                  >
                    <LuCloudDownload />
                  </Button>

                  <Button
                    icon
                    disabled={project.isPurchased}
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
                    disabled={project.isPurchased}
                    className="text-red-400"
                    variant="ghost"
                    onClick={() =>
                      startTransition(() => handleDeleteAction(project.id))
                    }
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
      </Dialog>
      <ConfirmImport
        importResult={importResult}
        setImportResult={setImportResult}
      />
    </>
  );
}
