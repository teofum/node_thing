import {
  ComponentProps,
  Dispatch,
  SetStateAction,
  useRef,
  useState,
} from "react";
import { LuCloudDownload, LuPlus, LuSave, LuTrash2 } from "react-icons/lu";

import { Dialog, DialogClose } from "@/ui/dialog";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Select, SelectItem } from "@/ui/select";
import { HandleDescriptor, useMainStore } from "@/store/main.store";
import { deleteProject, saveProjectOnline, updateProjectName } from "./actions";
import { Tables } from "@/lib/supabase/database.types";

type ManageProjectsProps = {
  trigger: ComponentProps<typeof Dialog>["trigger"];
  projects: Tables<"projects">[];
};

export function ManageProjects({ trigger, projects }: ManageProjectsProps) {
  const importProject = useMainStore((s) => s.importProject);
  const exportProject = useMainStore((s) => s.exportProject);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [nameDraft, setNameDraft] = useState<string>("");

  async function handleRename(projectId: string) {
    await updateProjectName(projectId, nameDraft);
    setEditingId(null);
  }

  async function handleDelete(projectId: string) {
    await deleteProject(projectId);
  }

  async function handleSaveCurrent() {
    await saveProjectOnline(exportProject());
  }

  return (
    <Dialog
      trigger={trigger}
      title="Project Manager"
      description="Manage projects lol"
    >
      test dialog
    </Dialog>
  );
}
