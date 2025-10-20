import { createClient } from "./server";
import { redirect } from "next/navigation";

export async function getSupabaseUserOrRedirect() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`$/auth/login/?next=${encodeURIComponent("/")}`);
  }

  return { supabase, user };
}
