import { createClient } from "@/lib/supabase/server";
import { signOutAction } from "@/lib/auth/actions";
import { LinkButton, Button } from "@/ui/button";

export async function AuthButton() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user ? (
    <div className="flex items-center gap-4">
      <span className="text-sm">Hey, {user.email}!</span>
      <form action={signOutAction} className="inline">
        <Button type="submit" variant="outline" size="sm">
          Logout
        </Button>
      </form>
    </div>
  ) : (
    <LinkButton href="/auth/login">Sign in</LinkButton>
  );
}
