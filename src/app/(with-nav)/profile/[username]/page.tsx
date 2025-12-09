import { notFound } from "next/navigation";
import * as Tabs from "@radix-ui/react-tabs";
import ProfileHeader from "../components/profile-header";
import ItemsTab from "../components/items-tab";
import PremiumTab from "../components/premium-tab";
import SettingsTab from "../components/settings-tab";
import {
  getPublicPublishedShaders,
  getPublicPublishedProjects,
} from "../actions/public";
import {
  getPurchasedShaders,
  getPurchasedProjects,
  getUserRatings,
} from "../actions/private";
import { getUserData } from "../actions/user";
import { getSupabaseUserOrRedirect } from "@/lib/supabase/auth-util";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const { supabase, user } = await getSupabaseUserOrRedirect();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username")
    .eq("username", username)
    .single();

  if (!profile) {
    notFound();
  }

  const isOwnProfile = user.id === profile.id;

  const publishedShaders = await getPublicPublishedShaders(username);
  const publishedProjects = await getPublicPublishedProjects(username);
  const purchasedShaders = isOwnProfile ? await getPurchasedShaders() : [];
  const purchasedProjects = isOwnProfile ? await getPurchasedProjects() : [];
  const userShaderRatings = isOwnProfile
    ? await getUserRatings("shader_id")
    : [];
  const userProjectRatings = isOwnProfile
    ? await getUserRatings("project_id")
    : [];
  let userData, profileUser;
  if (isOwnProfile) {
    userData = await getUserData();
  } else {
    const { data: publicProfile } = await supabase
      .from("profiles")
      .select("username, display_name, is_premium, avatar_url")
      .eq("id", profile.id)
      .single();
    const { data: authUser } = await supabase.auth.admin.getUserById(
      profile.id,
    );
    userData = {
      username: publicProfile?.username || username,
      displayName: publicProfile?.display_name || null,
      isPremium: publicProfile?.is_premium || null,
    };
    profileUser = {
      ...user,
      id: profile.id,
      user_metadata: {
        avatar_url:
          publicProfile?.avatar_url ||
          authUser?.user?.user_metadata?.avatar_url ||
          "",
      },
    };
  }

  const triggerStyle =
    "flex h-[45px] hover:bg-white/5 flex-1 cursor-default select-none items-center justify-center px-5 font-semibold text-sm leading-none outline-none first:rounded-tl-2xl last:rounded-tr-2xl data-[state=active]:border-teal-500 data-[state=active]:border-b-2 transition data-[state=active]:focus:relative";

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <ProfileHeader
          user={isOwnProfile ? user : profileUser!}
          userData={userData}
          publishedCount={publishedShaders.length}
          isOwnProfile={isOwnProfile}
        />

        <Tabs.Root
          className="flex flex-col border border-white/15 rounded-2xl"
          defaultValue="tab1"
        >
          <Tabs.List className="flex shrink-0">
            <Tabs.Trigger className={triggerStyle} value="tab1">
              Published
            </Tabs.Trigger>
            {isOwnProfile && (
              <>
                <Tabs.Trigger className={triggerStyle} value="tab2">
                  Purchased
                </Tabs.Trigger>
                <Tabs.Trigger className={triggerStyle} value="tab3">
                  Premium
                </Tabs.Trigger>
                <Tabs.Trigger className={triggerStyle} value="tab4">
                  Settings
                </Tabs.Trigger>
              </>
            )}
          </Tabs.List>
          <Tabs.Content
            className="grow rounded-b-md p-5 outline-none"
            value="tab1"
          >
            <ItemsTab
              shadersList={publishedShaders}
              projectsList={publishedProjects}
              shadersRatingsList={userShaderRatings}
              projectsRatingsList={userProjectRatings}
              isOwnProfile={isOwnProfile}
              isPurchasedTab={false}
              username={username}
            />
          </Tabs.Content>
          {isOwnProfile && (
            <>
              <Tabs.Content
                className="grow rounded-b-md p-5 outline-none"
                value="tab2"
              >
                <ItemsTab
                  shadersList={purchasedShaders}
                  projectsList={purchasedProjects}
                  shadersRatingsList={userShaderRatings}
                  projectsRatingsList={userProjectRatings}
                  isOwnProfile={isOwnProfile}
                  isPurchasedTab={true}
                />
              </Tabs.Content>
              <Tabs.Content
                className="grow rounded-b-md p-5 outline-none"
                value="tab3"
              >
                <PremiumTab
                  className="rounded-2xl p-4 min-h-[300px] mb-3"
                  userData={userData}
                  user={user}
                />
              </Tabs.Content>
              <Tabs.Content
                className="grow rounded-b-md p-5 outline-none"
                value="tab4"
              >
                <SettingsTab
                  className="rounded-2xl p-4 min-h-[300px] mb-3"
                  userData={userData}
                  user={user}
                />
              </Tabs.Content>
            </>
          )}
        </Tabs.Root>
      </div>
    </div>
  );
}
