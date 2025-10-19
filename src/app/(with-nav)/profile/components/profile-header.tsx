import Image from "next/image";
import { LuGem, LuPencil } from "react-icons/lu";
import { signOutAction } from "@/app/auth/actions";
import { Button } from "@/ui/button";
import type { User } from "@supabase/supabase-js";
import type { UserData } from "../page";
import AvatarEditor from "../dialogs/change-avatar";

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
        <AvatarEditor
          currentAvatarUrl={user.user_metadata.avatar_url}
          trigger={
            <div className="relative w-[80px] h-[80px] rounded-full overflow-hidden cursor-pointer group">
              <Image
                src={user.user_metadata.avatar_url}
                alt=""
                width={80}
                height={80}
                unoptimized
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <LuPencil className="text-white text-base" />
              </div>
            </div>
          }
        />
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white">
              {userData.displayName || userData.username}
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
