import { createClient } from "@/lib/supabase/server";

import { LinkButton } from "@/ui/button";
import { LogoutButton } from "./logout-button";

export async function AuthButton() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  return user ? (
    <div className="flex items-center gap-4">
      <span className="text-sm">Hey, {user.email}!</span>
      <LogoutButton />
    </div>
  ) : (
    <LinkButton href="/auth/login">Sign in</LinkButton>
  );
}
