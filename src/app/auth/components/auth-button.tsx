import { createClient } from "@/lib/supabase/server";
import { signOutAction } from "../actions";
import { LinkButton, Button } from "@/ui/button";
import Image from "next/image";
import { Popover } from "@/ui/popover";
import { LuLogOut } from "react-icons/lu";

export async function AuthButton() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <LinkButton variant="outline" href="/auth/login">
        Sign in
      </LinkButton>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  const displayName = user.user_metadata?.full_name || user.email;

  return (
    <div className="flex items-center gap-4">
      <Popover
        trigger={
          <Button icon size="sm" variant="ghost" className="!rounded-full">
            <Image
              src={user.user_metadata.avatar_url}
              alt=""
              width={36}
              height={36}
              unoptimized
              className="rounded-full border border-white/15 outline-2 outline-offset-1 outline-teal-700 hover:outline-teal-500 transition-colors"
            />
          </Button>
        }
        side="bottom"
        align="end"
        sideOffset={4}
        className="min-w-56 flex flex-col p-3"
      >
        <span className="text-lg font-bold mb-3 text-center">
          Hey, {displayName}!
        </span>
        <div className="flex flex-col gap-1 pt-2 border-t border-white/15">
          <LinkButton href={`/profile/${profile?.username}`} variant="ghost">
            Profile
          </LinkButton>
          <form action={signOutAction} className="inline">
            <Button
              type="submit"
              variant="ghost"
              className="text-red-400 w-full"
            >
              <LuLogOut />
              Sign out
            </Button>
          </form>
        </div>
      </Popover>
    </div>
  );
}
