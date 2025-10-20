import { createClient } from "./server";
import { redirect } from "next/navigation";

export async function getSupabaseUserOrRedirect(nextPath: string = "/") {
  if (!nextPath.startsWith("/")) {
    throw new Error(`Invalid nextPath: "${nextPath}", should start with '/'`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/login?next=${encodeURIComponent(nextPath)}`);
  }

  return { supabase, user };
}
