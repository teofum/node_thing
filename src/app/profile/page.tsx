import { Button, LinkButton } from "@/ui/button";
import {
  LuArrowLeft,
  LuCalendar,
  LuMail,
  LuMedal,
  LuGem,
  LuUser,
} from "react-icons/lu";
import { signOutAction } from "../auth/actions";
import {
  getUserShaders,
  getUser,
  getUserData,
  getUserRatings,
} from "./actions";
import * as Tabs from "@radix-ui/react-tabs";
import { IconType } from "react-icons/lib";
import { forwardRef } from "react";
import RatingEditor from "./rating-editor";
import RatingCard from "./ratingcard";
import { Tables } from "@/lib/supabase/database.types";

function parseDate(date: string) {
  const idx = date.indexOf("T");
  return date.substring(0, idx);
}

type AccountInfoLine = { id: string; icon: IconType; text: string };
type AccountInfoProps = {
  lines: AccountInfoLine[];
} & React.HTMLAttributes<HTMLDivElement>;

const AccountInfoTab = forwardRef<HTMLDivElement, AccountInfoProps>(
  ({ lines, className, ...props }, forwardedRef) => {
    return (
      <div className={className} {...props} ref={forwardedRef}>
        <h2 className="text-xl font-semibold mb-4">Account Information</h2>
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
  average_rating: number | null;
  category: {
    name: string;
  };
  rating_count?: number | null;
};

export type UserRatingsDisplay = {
  id: string;
  shader_id: string | null;
  rating: number | null;
  comment: string | null;
  updated_at: string | null;
};

type ShadersTabProps = {
  shaderList: UserShaderDisplay[];
  ratingsList: UserRatingsDisplay[];
} & React.HTMLAttributes<HTMLDivElement>;

const UserShadersTab = forwardRef<HTMLDivElement, ShadersTabProps>(
  ({ shaderList, ratingsList, className, ...props }, forwardedRef) => {
    return (
      <div className={className} {...props} ref={forwardedRef}>
        <h2 className="text-xl font-semibold mb-4">Purchased Shaders</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shaderList.map((shader) => (
            <RatingCard
              key={shader.id}
              id={shader.id}
              title={shader.title}
              category={shader.category.name}
              average_rating={shader.average_rating}
              userRating={
                ratingsList.find((r) => r.shader_id === shader.id) ?? null
              }
              ratingCount={shader?.rating_count ?? 0}
              trigger={<Button variant="outline">test</Button>}
            />
          ))}
        </div>
        <h2 className="text-xl font-semibold mb-4 mt-8">Published Shaders</h2>
        TODO
      </div>
    );
  },
);
UserShadersTab.displayName = "UserShadersTab";

export default async function ProfilePage() {
  const userShaders = await getUserShaders();
  const userRatings = await getUserRatings();

  const userData = await getUserData();
  const user = await getUser();

  const accountInfo: AccountInfoLine[] = [
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
    {
      id: "premium",
      icon: LuMedal, // o LuGem u otro
      text: `Premium: ${userData.is_premium}`,
    },
  ];

  const triggerStyle =
    "flex h-[45px] hover:bg-white/5 flex-1 cursor-default select-none items-center justify-center px-5 font-semibold text-[15px] leading-none outline-none first:rounded-tl-2xl last:rounded-tr-2xl data-[state=active]:shadow-[0_2px_0_0] data-[state=active]:shadow-teal-400 transition data-[state=active]:focus:relative";

  return (
    <>
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
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {userData.username}
                </h1>
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
              className="flex flex-col shadow-[0_0_20px] shadow-black glass rounded-2xl"
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
                  Options
                </Tabs.Trigger>
              </Tabs.List>
              <Tabs.Content
                className="grow rounded-b-md p-5 outline-none"
                value="tab1"
              >
                <AccountInfoTab
                  className="bg-black/50 rounded-2xl p-4 min-h-[300px] mb-3"
                  lines={accountInfo}
                />
              </Tabs.Content>
              <Tabs.Content
                className="grow rounded-b-md p-5 outline-none"
                value="tab2"
              >
                <UserShadersTab
                  className="bg-black/50 rounded-2xl p-4 min-h-[300px] mb-3"
                  shaderList={userShaders}
                  ratingsList={userRatings}
                />
              </Tabs.Content>
              <Tabs.Content
                className="grow rounded-b-md p-5 outline-none"
                value="tab3"
              >
                <div className="bg-black/50 rounded-2xl p-4 min-h-[300px] mb-3">
                  <h2 className="text-xl font-semibold mb-4">
                    Account Options
                  </h2>
                  <p>TODO</p>
                  <p>Change password, etc</p>
                </div>
              </Tabs.Content>
            </Tabs.Root>
          </div>
        </div>
      </div>
    </>
  );
}
