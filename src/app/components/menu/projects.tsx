"use client";

import { Menu, MenuItem, MenuSeparator } from "@/ui/menu-bar";
import {
  LuCloudDownload,
  LuCloudUpload,
  LuFolders,
  LuMedal,
} from "react-icons/lu";
import { loadProjectOnline, saveProjectOnline } from "./actions";
import Link from "next/link";
import { Tables } from "@/lib/supabase/database.types";
import { ManageProjects } from "./manage-projects";
import cn from "classnames";
import { exportProject, importProject } from "@/utils/project";
import { useState } from "react";

export interface ProjectsMenuProps {
  userData: {
    username: string;
    is_premium: boolean | null;
  } | null;
  projects: Tables<"projects">[];
}

export function ProjectsMenu({ userData, projects }: ProjectsMenuProps) {
  const [projectsManagerOpen, setProjectsManagerOpen] = useState(false);

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

  return (
    <>
      <Menu label="Projects" value="file">
        <MenuItem
          icon={<LuCloudUpload />}
          onClick={async () => saveProjectOnline(await exportProject())}
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
          projects.slice(0, 3).map((currProject) => (
            <MenuItem
              key={currProject.id}
              icon={<LuCloudDownload />}
              onClick={async () => {
                const blob = await loadProjectOnline(currProject.user_project);

                const file = new File([blob], currProject.user_project, {
                  type: blob.type,
                });

                await importProject(file);
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
      />
    </>
  );
}
