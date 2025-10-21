"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function checkLogin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }
}
