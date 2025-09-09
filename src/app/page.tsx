import { redirect } from "next/navigation";

import { Workspace } from "./components/workspace";
import { AuthButton } from "./auth/components/auth-button";
import { createClient } from "@/lib/supabase/server";
import { Renderer } from "./components/renderer";
import { LinkButton } from "@/ui/button";

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
  return (
    <div className="grid grid-rows-[auto_1fr] fixed w-screen h-screen bg-neutral-900">
      {/* header */}
      <div className="flex justify-between items-center px-2 pl-4 pt-3">
        <div className="flex items-center gap-4">
          <h1 className="font-semibold tracking-wide">node_thing</h1>
          <LinkButton href="/marketplace" variant="outline">
            Marketplace
          </LinkButton>
        </div>
        <AuthButton />
      </div>

      {/* barra de herramientas */}
      {/*<div className="p-4">
        <button className="bg-stone-800 px-2 py-1 rounded hover:bg-blue-700">
          Import
        </button>
        <button className="bg-stone-800 px-2 py-1 rounded hover:bg-blue-700">
          Export
        </button>
      </div>*/}

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
