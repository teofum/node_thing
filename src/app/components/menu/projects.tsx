"use client";

import {
  Menu,
  MenuItem,
  menuItemClassNames,
  MenuSeparator,
} from "@/ui/menu-bar";
import {
  LuCloudDownload,
  LuCloudUpload,
  LuFolders,
  LuMedal,
} from "react-icons/lu";
import { saveProjectOnline } from "./actions";
import Link from "next/link";
import { Tables } from "@/lib/supabase/database.types";
import { ManageProjects } from "./manage-projects";
import cn from "classnames";
import { zipExportProject, zipImportProject } from "@/utils/zip";
import { useState } from "react";

export interface ProjectsMenuProps {
  userData: {
    username: string;
    is_premium: boolean | null;
  } | null;
  projects: Tables<"projects">[];
  files: { name: string; blob: Blob }[];
}

export function ProjectsMenu({ userData, projects, files }: ProjectsMenuProps) {
  const [projectsManagerOpen, setProjectsManagerOpen] = useState(false);

  // caso sin login o sin premium
  if (!userData || !userData.is_premium) {
    return (
      <Menu label="Projects" value="file">
        <MenuItem icon={<LuMedal />}>
          {/* TODO acá redirigir a premium */}
          <Link href="/profile" className="w-full h-full">
            Premium
          </Link>
        </MenuItem>
      </Menu>
    );
  }

  // caso tiene premium
  return (
    <>
      <Menu label="Projects" value="file">
        <MenuItem
          icon={<LuCloudUpload />}
          onClick={async () => saveProjectOnline(await zipExportProject())}
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
          // muestro los últimos 3 modificados
          projects.slice(0, 3).map((currProject) => (
            <MenuItem
              key={currProject.id}
              icon={<LuCloudDownload />}
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
              {currProject.name}
            </MenuItem>
          ))
        ) : (
          <MenuItem>No saved projects...</MenuItem>
        )}
      </Menu>
      <ManageProjects
        trigger={null}
        open={projectsManagerOpen}
        onOpenChange={setProjectsManagerOpen}
        projects={projects}
        files={files}
      />
    </>
  );
}
