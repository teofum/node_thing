import Image from "next/image";
import { LuGem } from "react-icons/lu";
import { signOutAction } from "@/app/auth/actions";
import { Button } from "@/ui/button";
import type { User } from "@supabase/supabase-js";
import type { UserData } from "../page";

type ProfileHeaderProps = {
  user: User;
  userData: UserData;
  publishedCount: number;
};

export default function ProfileHeader({
  user,
  userData,
  publishedCount,
}: ProfileHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-8">
      <div className="flex items-center gap-4">
        <Image
          src={user.user_metadata.avatar_url}
          alt=""
          width={80}
          height={80}
          unoptimized
          className="rounded-full"
        />
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white">
              {user.user_metadata.full_name || userData.username}
            </h1>
            {userData.isPremium && <LuGem className="text-xl" />}
          </div>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-sm text-neutral-400">
              @{userData.username}
            </span>
            <span className="text-sm text-neutral-400">
              {publishedCount} shaders published
            </span>
          </div>
        </div>
      </div>
      <form action={signOutAction}>
        <Button type="submit" variant="outline">
          Logout
        </Button>
      </form>
    </div>
  );
}
