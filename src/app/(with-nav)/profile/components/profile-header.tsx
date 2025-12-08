import Image from "next/image";
import { LuGem, LuPencil } from "react-icons/lu";
import { signOutAction } from "@/app/auth/actions";
import { Button } from "@/ui/button";
import type { User } from "@supabase/supabase-js";
import type { UserData } from "../actions/user";
import AvatarEditor from "../dialogs/change-avatar";

type ProfileHeaderProps = {
  user: User;
  userData: UserData;
  publishedCount: number;
  isOwnProfile: boolean;
};

export default function ProfileHeader({
  user,
  userData,
  publishedCount,
  isOwnProfile,
}: ProfileHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-8">
      <div className="flex items-center gap-4">
        <AvatarEditor
          currentAvatarUrl={user.user_metadata.avatar_url}
          trigger={
            <button
              type="button"
              className="relative w-20 h-20 rounded-full overflow-hidden group"
            >
              <Image
                src={user.user_metadata.avatar_url}
                alt=""
                width={80}
                height={80}
                unoptimized
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <LuPencil className="text-base" />
              </div>
            </button>
          }
        />
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">
              {userData.displayName || userData.username}
            </h1>
            {userData.isPremium && <LuGem className="text-xl" />}
          </div>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-sm text-white/60">@{userData.username}</span>
            <span className="text-sm text-white/60">
              {publishedCount} shaders published
            </span>
          </div>
        </div>
      </div>
      {isOwnProfile && (
        <form action={signOutAction}>
          <Button type="submit" variant="outline">
            Logout
          </Button>
        </form>
      )}
    </div>
  );
}
