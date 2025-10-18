// TODO modularizar página

import * as Tabs from "@radix-ui/react-tabs";
import Image from "next/image";
import { forwardRef } from "react";
import { IconType } from "react-icons/lib";
import { LuCloudUpload, LuGem, LuGlobe, LuSparkles } from "react-icons/lu";

import { signOutAction } from "@/app/auth/actions";
import { Button } from "@/ui/button";
import type { User } from "@supabase/supabase-js";
import AccountEditor from "./dialogs/change-username";
import DisplayNameEditor from "./dialogs/change-displayname";
import PasswordEditor from "./dialogs/change-password";

import {
  cancelSubscriptionAction,
  getPublishedShaders,
  getPurchasedShaders,
  getUser,
  getUserData,
  getUserRatings,
  resumeSubscriptionAction,
  subscribePremiumAction,
} from "./actions";
import RatingCard from "./components/ratingcard";

export type UserData = {
  username: string;
  isPremium: boolean | null;
  cancelled?: boolean | null;
  subscriptionId?: string | null;
};

type IconTextLine = { id: string; icon: IconType; text: string };
type SettingsTabProps = {
  userData: UserData;
  user: User;
} & React.HTMLAttributes<HTMLDivElement>;

const SettingsTab = forwardRef<HTMLDivElement, SettingsTabProps>(
  ({ userData, user, className, ...props }, forwardedRef) => {
    return (
      <div className={className} {...props} ref={forwardedRef}>
        <div className="flex flex-col gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-6">Account Settings</h2>

            {/* Profile Information */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                  <div>
                    <p className="font-medium">Username</p>
                    <p className="text-sm text-neutral-400">
                      @{userData.username}
                    </p>
                  </div>
                  <AccountEditor
                    trigger={
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                    }
                    title="Edit Username"
                    userData={userData}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                  <div>
                    <p className="font-medium">Display Name</p>
                    <p className="text-sm text-neutral-400">
                      {user.user_metadata.full_name || "Not set"}
                    </p>
                  </div>
                  <DisplayNameEditor
                    trigger={
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                    }
                    currentDisplayName={user.user_metadata.full_name || ""}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-neutral-800/50 rounded-lg border border-white/5">
                <div>
                  <p className="font-medium text-neutral-400">Email</p>
                  <p className="text-sm text-neutral-500">{user.email!}</p>
                </div>
                <p className="text-xs text-neutral-500">Cannot be changed</p>
              </div>

              {user.app_metadata.provider === "email" && (
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                  <div>
                    <p className="font-medium">Password</p>
                  </div>
                  <PasswordEditor
                    trigger={
                      <Button size="sm" variant="outline">
                        Change
                      </Button>
                    }
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },
);
SettingsTab.displayName = "SettingsTab";

type UserShaderDisplay = {
  id: string;
  title: string;
  category: {
    name: string;
  };
};

export type UserRatingsDisplay = {
  id: string;
  shaderId: string | null;
  rating: number | null;
  comment: string | null;
  updatedAt: string | null;
};

type ShadersTabProps = {
  shaderList: UserShaderDisplay[];
  publishList: UserShaderDisplay[];
  ratingsList: UserRatingsDisplay[];
} & React.HTMLAttributes<HTMLDivElement>;

const UserShadersTab = forwardRef<HTMLDivElement, ShadersTabProps>(
  (
    { shaderList, publishList, ratingsList, className, ...props },
    forwardedRef,
  ) => {
    const purchasedCards =
      shaderList.length > 0 ? (
        shaderList.map((shader) => (
          <RatingCard
            key={shader.id}
            id={shader.id}
            title={shader.title}
            category={shader.category.name}
            averageRating={null}
            userRating={
              ratingsList.find((r) => r.shaderId === shader.id) ?? null
            }
            ratingCount={0}
            trigger={<Button variant="outline">test</Button>}
          />
        ))
      ) : (
        <p className="text-white/40">
          {"You haven't purchased any shaders yet"}
        </p>
      );

    const publishedCards =
      publishList.length > 0 ? (
        publishList.map((shader) => (
          <RatingCard
            key={shader.id}
            id={shader.id}
            title={shader.title}
            category={shader.category.name}
            averageRating={null}
            userRating={
              ratingsList.find((r) => r.shaderId === shader.id) ?? null
            }
            ratingCount={0}
            trigger={null}
          />
        ))
      ) : (
        <p className="text-white/40">
          {"You haven't published any shaders yet"}
        </p>
      );

    const subtabStyle =
      "flex h-[40px] hover:bg-white/5 flex-1 cursor-default select-none items-center justify-center px-4 font-medium text-sm leading-none outline-none first:rounded-tl-lg last:rounded-tr-lg data-[state=active]:border-teal-500 data-[state=active]:border-b-2 transition data-[state=active]:focus:relative";

    return (
      <div className={className} {...props} ref={forwardedRef}>
        <Tabs.Root defaultValue="published">
          <Tabs.List className="flex shrink-0 border border-white/10 rounded-lg mb-6">
            <Tabs.Trigger className={subtabStyle} value="published">
              Published
            </Tabs.Trigger>
            <Tabs.Trigger className={subtabStyle} value="library">
              Library
            </Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="published">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publishedCards}
            </div>
          </Tabs.Content>
          <Tabs.Content value="library">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {purchasedCards}
            </div>
          </Tabs.Content>
        </Tabs.Root>
      </div>
    );
  },
);
UserShadersTab.displayName = "UserShadersTab";

type PremiumTabProps = {
  userData: UserData;
} & React.HTMLAttributes<HTMLDivElement>;

const PremiumTab = forwardRef<HTMLDivElement, PremiumTabProps>(
  ({ userData, className, ...props }, forwardedRef) => {
    const featureList: IconTextLine[] = [
      {
        id: "cloud",
        icon: LuCloudUpload,
        text: "Save your projects on the cloud",
      },
      {
        id: "publish",
        icon: LuGlobe,
        text: "Publish and sell shaders on the marketplace",
      },
      {
        id: "ai",
        icon: LuSparkles,
        text: "Generate shaders with AI (WIP)",
      },
    ];

    const variantId = process.env.LEMONSQUEEZY_PREMIUM_VARIANT_ID;

    return (
      <div className={className} {...props} ref={forwardedRef}>
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Premium Subscription</h2>
          {userData.isPremium ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <p>You are a premium user</p>
                <LuGem />
                <p>Thank you for your support!</p>
              </div>
              <p className="text-neutral-400">
                {userData.cancelled
                  ? "Subscription valid until period end"
                  : "Subscription renews automatically"}
              </p>
              {userData.cancelled ? (
                <form action={resumeSubscriptionAction}>
                  <Button type="submit" size="lg" className="w-full">
                    Resume Subscription
                  </Button>
                </form>
              ) : (
                <form action={cancelSubscriptionAction}>
                  <Button
                    type="submit"
                    variant="outline"
                    size="lg"
                    className="w-full text-red-400 border-red-400 hover:bg-red-400/10"
                  >
                    Cancel Subscription
                  </Button>
                </form>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <p>Gain access to exclusive features with the premium version!</p>
              <div>
                {featureList.map(({ id, icon: Icon, text }) => (
                  <div className="flex items-center gap-2" key={id}>
                    <Icon /> {text}
                  </div>
                ))}
              </div>
              {variantId ? (
                <form action={subscribePremiumAction}>
                  <input type="hidden" name="variant_id" value={variantId} />
                  <Button type="submit" size="lg" className="w-full">
                    Get Started
                    <LuGem />
                  </Button>
                </form>
              ) : (
                <p className="text-red-400">Premium plan not available</p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  },
);
PremiumTab.displayName = "PremiumTab";

export default async function ProfilePage() {
  const purchasedShaders = await getPurchasedShaders();
  const publishedShaders = await getPublishedShaders();
  const userRatings = await getUserRatings();

  const userData = await getUserData();
  const user = await getUser();

  const triggerStyle =
    "flex h-[45px] hover:bg-white/5 flex-1 cursor-default select-none items-center justify-center px-5 font-semibold text-[15px] leading-none outline-none first:rounded-tl-2xl last:rounded-tr-2xl data-[state=active]:border-teal-500 data-[state=active]:border-b-2 transition data-[state=active]:focus:relative";

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
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
                  {publishedShaders.length} shaders published
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
            <UserShadersTab
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
