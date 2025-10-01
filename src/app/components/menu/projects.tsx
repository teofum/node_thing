"use client";

import { Menu, MenuItem, MenuSeparator } from "@/ui/menu-bar";
import { LuCloudDownload, LuCloudUpload, LuMedal } from "react-icons/lu";
import { saveProjectOnline } from "./actions";
import Link from "next/link";
import { Project, useMainStore } from "@/store/main.store";
import { Tables } from "@/lib/supabase/database.types";

export interface ProjectsMenuProps {
  userData: {
    username: string;
    is_premium: boolean | null;
  } | null;
  projects: Tables<"projects">[];
}

export function ProjectsMenu({ userData, projects }: ProjectsMenuProps) {
  const importProject = useMainStore((s) => s.importProject);
  const exportProject = useMainStore((s) => s.exportProject);

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
          onClick={() => saveProjectOnline(exportProject())}
        >
          Save Online
        </MenuItem>

        <MenuSeparator />

        {projects.length ? (
          projects.map((currProject) => (
            <MenuItem
              key={currProject.id}
              icon={<LuCloudDownload />}
              onClick={() =>
                importProject(
                  currProject.data
                    ? (currProject.data as unknown as Project)
                    : "",
                )
              }
            >
              {/* TODO agregar nombre de proyecto en el store */}
              {currProject.updated_at}
              TODO name
            </MenuItem>
          ))
        ) : (
          <MenuItem>No saved projects...</MenuItem>
        )}
      </Menu>
    </>
  );
}
