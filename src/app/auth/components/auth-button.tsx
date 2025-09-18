import { createClient } from "@/lib/supabase/server";
import { signOutAction } from "../actions";
import { LinkButton, Button } from "@/ui/button";

export async function AuthButton() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <LinkButton href="/auth/login">Sign in</LinkButton>;
  }

  const displayName = user.user_metadata?.full_name || user.email;

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm">Hey, {displayName}!</span>
      <form action={signOutAction} className="inline">
        <Button type="submit" variant="outline">
          Logout
        </Button>
      </form>
    </div>
  );
}
