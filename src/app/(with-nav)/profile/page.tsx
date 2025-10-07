// TODO modularizar página

import * as Tabs from "@radix-ui/react-tabs";
import Image from "next/image";
import { forwardRef } from "react";
import { IconType } from "react-icons/lib";
import {
  LuArrowLeft,
  LuCalendar,
  LuCloudUpload,
  LuGem,
  LuGlobe,
  LuMail,
  LuSparkles,
  LuSquarePen,
  LuUser,
} from "react-icons/lu";

import { signOutAction } from "@/app/auth/actions";
import { Button, LinkButton } from "@/ui/button";
import AccountEditor from "./account-editor";
import {
  cancelSubscriptionAction,
  getPublishedShaders,
  getPurchasedShaders,
  getUser,
  getUserData,
  getUserRatings,
  resumeSubscriptionAction,
  subscribePremiumAction,
  updatePayoutSettingsAction,
} from "./actions";
import RatingCard from "./components/ratingcard";

function parseDate(date: string) {
  const idx = date.indexOf("T");
  return date.substring(0, idx);
}

export type UserData = {
  username: string;
  isPremium: boolean | null;
  mpEmail?: string | null;
  pendingBalance?: number | null;
  cancelled?: boolean | null;
  subscriptionId?: string | null;
};

type IconTextLine = { id: string; icon: IconType; text: string };
type AccountInfoProps = {
  lines: IconTextLine[];
  userData: UserData;
} & React.HTMLAttributes<HTMLDivElement>;

const AccountInfoTab = forwardRef<HTMLDivElement, AccountInfoProps>(
  ({ lines, userData, className, ...props }, forwardedRef) => {
    return (
      <div className={className} {...props} ref={forwardedRef}>
        <div className="flex gap-3 items-center text-xl font-semibold mb-4">
          <h2>Account Information</h2>
          <AccountEditor
            trigger={
              <div className="cursor-pointer hover:bg-white/15 transition duration-80 rounded scale-150">
                <LuSquarePen className="scale-66" />
              </div>
            }
            title="Edit Account Information"
            userData={userData}
          />
        </div>
        {lines.map(({ id, icon: Icon, text }) => (
          <div key={id} className="flex h gap-2 items-center">
            <Icon /> {text}
          </div>
        ))}
      </div>
    );
  },
);
AccountInfoTab.displayName = "AccountInfoTab";

type UserShaderDisplay = {
  id: string;
  title: string;
  averageRating: number | null;
  category: {
    name: string;
  };
  ratingCount?: number | null;
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
            averageRating={shader.averageRating}
            userRating={
              ratingsList.find((r) => r.shaderId === shader.id) ?? null
            }
            ratingCount={shader?.ratingCount ?? 0}
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
            averageRating={shader.averageRating}
            userRating={
              ratingsList.find((r) => r.shaderId === shader.id) ?? null
            }
            ratingCount={shader?.ratingCount ?? 0}
            trigger={null}
          />
        ))
      ) : (
        <p className="text-white/40">
          {"You haven't published any shaders yet"}
        </p>
      );

    return (
      <div className={className} {...props} ref={forwardedRef}>
        <h2 className="text-xl font-semibold mb-4">Purchased Shaders</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {purchasedCards}
        </div>

        <h2 className="text-xl font-semibold mb-4 mt-8">Published Shaders</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publishedCards}
        </div>
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

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Payout Settings</h3>
            <p className="text-neutral-400 text-sm mb-4">
              Configure your Mercado Pago email to receive payments from shader
              sales
            </p>
            <form action={updatePayoutSettingsAction}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Mercado Pago Email
                </label>
                <input
                  type="email"
                  name="mp_email"
                  defaultValue={userData.mpEmail || ""}
                  placeholder="tu@email.com"
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-neutral-500"
                />
              </div>
              <div className="bg-neutral-800 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-300">Pending earnings:</span>
                  <span className="text-xl font-bold text-teal-400">
                    ${(userData.pendingBalance || 0).toFixed(2)} ARS
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-2">
                  Paid weekly via Mercado Pago
                </p>
              </div>
              <Button type="submit" size="lg" className="w-full">
                Save Payout Settings
              </Button>
            </form>
          </div>
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

  const accountInfo: IconTextLine[] = [
    {
      id: "username",
      icon: LuUser,
      text: `Username: ${userData.username}`,
    },
    {
      id: "creation",
      icon: LuCalendar,
      text: `Date created: ${parseDate(user.created_at)}`,
    },
    {
      id: "email",
      icon: LuMail,
      text: `Email: ${user.email}`,
    },
  ];

  const triggerStyle =
    "flex h-[45px] hover:bg-white/5 flex-1 cursor-default select-none items-center justify-center px-5 font-semibold text-[15px] leading-none outline-none first:rounded-tl-2xl last:rounded-tr-2xl data-[state=active]:border-teal-500 data-[state=active]:border-b-2 transition data-[state=active]:focus:relative";

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <Image
              src={user.user_metadata.avatar_url}
              alt=""
              width={100}
              height={100}
              unoptimized
              className="rounded-full"
            />
            <h1 className="text-3xl font-bold text-white">
              {userData.username}
            </h1>
            {userData.isPremium && <LuGem className="text-2xl" />}
          </div>
          <div className="flex gap-4">
            <form action={signOutAction} className="inline">
              <Button type="submit" variant="outline">
                Logout
              </Button>
            </form>
          </div>
        </div>

        <Tabs.Root
          className="flex flex-col glass rounded-2xl"
          defaultValue="tab1"
        >
          <Tabs.List className="flex shrink-0">
            <Tabs.Trigger className={triggerStyle} value="tab1">
              Info
            </Tabs.Trigger>
            <Tabs.Trigger className={triggerStyle} value="tab2">
              Shaders
            </Tabs.Trigger>
            <Tabs.Trigger className={triggerStyle} value="tab3">
              Premium
            </Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content
            className="grow rounded-b-md p-5 outline-none"
            value="tab1"
          >
            <AccountInfoTab
              className="bg-black/50 rounded-2xl p-4 min-h-[300px] mb-3"
              lines={accountInfo}
              userData={userData}
            />
          </Tabs.Content>
          <Tabs.Content
            className="grow rounded-b-md p-5 outline-none"
            value="tab2"
          >
            <UserShadersTab
              className="bg-black/50 rounded-2xl p-4 min-h-[300px] mb-3"
              shaderList={purchasedShaders}
              publishList={publishedShaders}
              ratingsList={userRatings}
            />
          </Tabs.Content>
          <Tabs.Content
            className="grow rounded-b-md p-5 outline-none"
            value="tab3"
          >
            <PremiumTab
              className="bg-black/50 rounded-2xl p-4 min-h-[300px] mb-3"
              userData={userData}
            />
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  );
}
