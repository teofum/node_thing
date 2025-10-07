// TODO modularizar página

import { Button, LinkButton } from "@/ui/button";
import {
  LuArrowLeft,
  LuCalendar,
  LuMail,
  LuGem,
  LuUser,
  LuSquarePen,
  LuCloudUpload,
  LuGlobe,
  LuSparkles,
} from "react-icons/lu";
import { signOutAction } from "../auth/actions";
import {
  getPublishedShaders,
  getPurchasedShaders,
  getUser,
  getUserData,
  getUserRatings,
} from "./actions";
import * as Tabs from "@radix-ui/react-tabs";
import { IconType } from "react-icons/lib";
import { forwardRef } from "react";
import RatingCard from "./ratingcard";
import Image from "next/image";
import AccountEditor from "./account-editor";

function parseDate(date: string) {
  const idx = date.indexOf("T");
  return date.substring(0, idx);
}

export type UserData = {
  username: string;
  isPremium: boolean | null;
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

    return (
      <div className={className} {...props} ref={forwardedRef}>
        <div className="flex flex-col gap-4 items-center">
          <h2 className="text-xl font-semibold">Premium Subscription</h2>
          {userData.isPremium ? (
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2">
                <p>You are a premium user</p>
                <LuGem />
                <p>Thank you for your support!</p>
              </div>
              <p>
                You can cancel your subscription at any time with the button
                below.
              </p>
              <Button size="lg">Cancel Subscription</Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <p>Gain access to exclusive features with the premium version!</p>
              <div>
                {featureList.map(({ id, icon: Icon, text }) => (
                  <div className="flex items-center gap-2" key={id}>
                    <Icon /> {text}
                  </div>
                ))}
              </div>
              <Button size="lg">
                Get Started
                <LuGem />
              </Button>
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
    <div className="min-h-screen bg-neutral-900 relative">
      <LinkButton
        variant="ghost"
        href="/"
        size="md"
        className="absolute top-4 left-4"
      >
        <LuArrowLeft />
        Back
      </LinkButton>

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
    </div>
  );
}
