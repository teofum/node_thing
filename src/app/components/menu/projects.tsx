"use client";

import cn from "classnames";
import Link from "next/link";
import { startTransition, useActionState, useState } from "react";
import {
  LuCloudDownload,
  LuCloudUpload,
  LuFolders,
  LuMedal,
} from "react-icons/lu";

import { Tables } from "@/lib/supabase/database.types";
import { Menu, MenuItem, MenuSeparator } from "@/ui/menu-bar";
import { exportProject, importProject, ImportResult } from "@/utils/project";
import { loadProjectOnline, saveProjectOnline } from "./actions";
import { ManageProjects } from "./manage-projects";
import { ConfirmImport } from "./confirm-import";

export interface ProjectsMenuProps {
  userData: {
    username: string;
    is_premium: boolean | null;
  } | null;
  projects: Tables<"projects">[];
  purchasedProjects: Tables<"projects">[];
}

export function ProjectsMenu({
  userData,
  projects,
  purchasedProjects,
}: ProjectsMenuProps) {
  const [projectsManagerOpen, setProjectsManagerOpen] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult>(undefined);

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

  // TODO pending behaviour
  const [
    saveProjectOnlineState,
    saveProjectOnlineAction,
    saveProjectOnlinePending,
  ] = useActionState(async () => {
    await saveProjectOnline(await exportProject());
    return null;
  }, null);

  if (!userData || !userData.is_premium) {
    return (
      <Menu label="Projects" value="file">
        <MenuItem icon={<LuMedal />}>
          <Link
            href={`/profile/${userData?.username}`}
            className="w-full h-full"
          >
            Premium
          </Link>
        </MenuItem>
      </Menu>
    );
  }

  return (
    <>
      <Menu label="Projects" value="file">
        <MenuItem
          icon={<LuCloudUpload />}
          onClick={() => startTransition(() => saveProjectOnlineAction())}
        >
          Save Online
        </MenuItem>

        <MenuItem
          icon={<LuFolders />}
          onClick={() => setProjectsManagerOpen(true)}
        >
          Manage Projects
        </MenuItem>

        <MenuSeparator />
        <div
          className={cn(
            "min-w-40 select-none outline-none flex flex-row gap-2",
            "text-sm/4 rounded-lg py-1.5 px-3 pl-1",
            "transition-colors duration-150",
            "aria-[disabled]:text-white/40 aria-[disabled]:hover:bg-transparent aria-[disabled]:cursor-default",
          )}
        >
          Recent Projects:
        </div>

        {projects.length ? (
          projects.slice(0, 3).map((project) => (
            <MenuItem
              key={project.id}
              icon={<LuCloudDownload />}
              onClick={() => startTransition(() => handleOpenAction(project))}
            >
              {project.name}
            </MenuItem>
          ))
        ) : (
          <MenuItem>No saved projects</MenuItem>
        )}
      </Menu>
      <ManageProjects
        trigger={null}
        open={projectsManagerOpen}
        onOpenChange={setProjectsManagerOpen}
        projects={projects}
        purchasedProjects={purchasedProjects}
      />
      <ConfirmImport
        importResult={importResult}
        setImportResult={setImportResult}
      />
    </>
  );
}
