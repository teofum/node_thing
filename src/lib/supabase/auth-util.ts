import { createClient } from "./server";
import { redirect } from "next/navigation";

export async function getSupabaseUserOrRedirect(
  redirectPath: string = "/auth/login?next=/",
) {
  if (!redirectPath.startsWith("/")) {
    throw new Error(
      `Invalid nextPath: "${redirectPath}", should start with '/'`,
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(redirectPath);
  }

  return { supabase, user };
}
