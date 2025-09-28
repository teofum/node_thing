"use client";

import { Button, LinkButton } from "@/ui/button";
import { LuArrowLeft } from "react-icons/lu";
import { signOutAction } from "../auth/actions";
import { useState } from "react";

export default function ProfilePage() {
  // TODO hacer manejo de redirigir a login si no inició sesión
  // TODO meter actions.ts si es necesario

  const [tab, setTab] = useState<"user" | "shaders">("user");

  return (
    <>
      <div className="min-h-screen bg-neutral-900 relative">
        <LinkButton
          variant="ghost"
          href="/"
          size="md"
          className="absolute top-4 left-4"
        >
          <LuArrowLeft />
          Back
        </LinkButton>

        <div className="p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white">
                  TODO username...
                </h1>
              </div>
              <div className="flex gap-4">
                <form action={signOutAction} className="inline">
                  <Button type="submit" variant="outline">
                    Logout
                  </Button>
                </form>
              </div>
            </div>

            <div className="flex gap-4 mb-6">
              <Button variant="default" onClick={() => setTab("user")}>
                User data
              </Button>
              <Button variant="default" onClick={() => setTab("shaders")}>
                My Shaders
              </Button>
            </div>

            <div className="bg-neutral-800 rounded-2xl shadow p-6 min-h-[300px] text-white">
              {tab === "user" && <div>TODO</div>}
              {tab === "shaders" && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">My Shaders</h2>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
