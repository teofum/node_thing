"use server";

import { Menu, MenuItem, MenuSeparator } from "@/ui/menu-bar";
import { LuCloudDownload, LuCloudUpload, LuMedal } from "react-icons/lu";
import { getUserData } from "./actions";
import Link from "next/link";

export async function ProjectsMenu() {
  const user = await getUserData();

  // caso sin login o sin premium
  if (!user || !user.is_premium) {
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
      {/* TODO agregar concional acá */}
      <Menu label="Projects" value="file">
        <MenuItem
          icon={<LuCloudUpload />}
          //onClick={}
        >
          Save Online
        </MenuItem>

        <MenuSeparator />

        <MenuItem
          icon={<LuCloudDownload />}
          //onClick={}
        >
          (for each Project)
        </MenuItem>
      </Menu>
    </>
  );
}
