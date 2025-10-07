import { redirect } from "next/navigation";

import { Workspace } from "./components/workspace";
import { AuthButton } from "./auth/components/auth-button";
import { createClient } from "@/lib/supabase/server";
import { Renderer } from "./components/renderer";
import { LinkButton } from "@/ui/button";
import { Menubar } from "@/ui/menu-bar";
import { FileMenu } from "./components/menu/file";
import { LayerMenu } from "./components/menu/layer";
import { ProjectsMenu } from "./components/menu/projects";
import { Tables } from "@/lib/supabase/database.types";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single();

    if (!profile) {
      redirect("/onboarding");
    }
  }

  let projects: Tables<"projects">[] = [];
  let userData = null;

  if (user) {
    const { data: data, error } = await supabase
      .from("profiles")
      .select("username, is_premium")
      .eq("id", user.id)
      .single();

    if (error) {
      throw new Error(`Failed to load user data: ${error.message}`);
    }

    userData = data;

    if (data?.is_premium) {
      const { data: projectData } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });
      projects = projectData ?? [];
    }
  }

  return (
    <div className="grid grid-rows-[auto_1fr] fixed w-screen h-screen bg-neutral-900">
      {/* header */}
      <div className="flex items-center px-4 pt-3 gap-4">
        <h1 className="font-semibold tracking-wide">node_thing</h1>

        <Menubar className="mr-auto">
          <FileMenu />
          <LayerMenu />
          <ProjectsMenu userData={userData} projects={projects} />
        </Menubar>

        <LinkButton href="/marketplace" variant="outline">
          Marketplace
        </LinkButton>

        <AuthButton />
      </div>

      {/* Main panel */}
      <main className="flex flex-row min-h-0 max-w-full select-none p-2">
        <Workspace />

        {/* Output panel */}
        <div className="relative min-h-0">
          <div className="absolute inset-0 left-2 z-10">
            <Renderer />
          </div>

          {/* CSS resize hack */}
          <div className="absolute left-0.5 top-1/2 -translate-y-1/2 h-4 w-1 rounded bg-neutral-600 cursor-col-resize" />
          <div className="relative top-1/2 -translate-y-1/2 h-4 w-full resize-x min-w-120 max-w-[70vw] -ml-1.5 overflow-hidden [direction:rtl] opacity-0 cursor-col-resize" />
        </div>
      </main>
    </div>
  );
}
