import * as Tabs from "@radix-ui/react-tabs";
import ProfileHeader from "./components/profile-header";
import ShadersTab from "./components/shaders-tab";
import PremiumTab from "./components/premium-tab";
import SettingsTab from "./components/settings-tab";
import {
  getPublishedShaders,
  getPurchasedShaders,
  getUserRatings,
} from "./actions/shaders";
import { getUserData } from "./actions/user";
import { getSupabaseUserOrRedirect } from "@/lib/supabase/auth-util";

export type UserData = {
  username: string;
  displayName: string | null;
  isPremium: boolean | null;
  mpAccessToken?: string | null;
  cancelled?: boolean | null;
  subscriptionId?: string | null;
};

export type UserRatingsDisplay = {
  id: string;
  shaderId: string | null;
  rating: number | null;
  comment: string | null;
  updatedAt: string | null;
};

export default async function ProfilePage() {
  const purchasedShaders = await getPurchasedShaders();
  const publishedShaders = await getPublishedShaders();
  const userRatings = await getUserRatings();
  const userData = await getUserData();
  const { supabase, user } = await getSupabaseUserOrRedirect();

  const triggerStyle =
    "flex h-[45px] hover:bg-white/5 flex-1 cursor-default select-none items-center justify-center px-5 font-semibold text-[15px] leading-none outline-none first:rounded-tl-2xl last:rounded-tr-2xl data-[state=active]:border-teal-500 data-[state=active]:border-b-2 transition data-[state=active]:focus:relative";

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <ProfileHeader
          user={user}
          userData={userData}
          publishedCount={publishedShaders.length}
        />

        <Tabs.Root
          className="flex flex-col border border-white/15 rounded-2xl"
          defaultValue="tab1"
        >
          <Tabs.List className="flex shrink-0">
            <Tabs.Trigger className={triggerStyle} value="tab1">
              Shaders
            </Tabs.Trigger>
            <Tabs.Trigger className={triggerStyle} value="tab2">
              Premium
            </Tabs.Trigger>
            <Tabs.Trigger className={triggerStyle} value="tab3">
              Settings
            </Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content
            className="grow rounded-b-md p-5 outline-none"
            value="tab1"
          >
            <ShadersTab
              className="rounded-2xl p-4 min-h-[300px] mb-3"
              shaderList={purchasedShaders}
              publishList={publishedShaders}
              ratingsList={userRatings}
            />
          </Tabs.Content>
          <Tabs.Content
            className="grow rounded-b-md p-5 outline-none"
            value="tab2"
          >
            <PremiumTab
              className="rounded-2xl p-4 min-h-[300px] mb-3"
              userData={userData}
              user={user}
            />
          </Tabs.Content>
          <Tabs.Content
            className="grow rounded-b-md p-5 outline-none"
            value="tab3"
          >
            <SettingsTab
              className="rounded-2xl p-4 min-h-[300px] mb-3"
              userData={userData}
              user={user}
            />
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  );
}
