import { Button, LinkButton } from "@/ui/button";
import { LuArrowLeft, LuCalendar, LuMail } from "react-icons/lu";
import { signOutAction } from "../auth/actions";
import RatingShaderCard from "../components/profile/rating-shadercard";
import { getUserShaders, getUser, getUserData } from "./actions";
import { IconType } from "react-icons/lib";
import { forwardRef } from "react";

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
        <h2 className="text-xl font-semibold mb-4">Account info</h2>
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
};
type ShadersTabProps = {
  shaderList: UserShaderDisplay[];
} & React.HTMLAttributes<HTMLDivElement>;

const UserShadersTab = forwardRef<HTMLDivElement, ShadersTabProps>(
  ({ shaderList, className, ...props }, forwardedRef) => {
    return (
      <div className={className} {...props} ref={forwardedRef}>
        <h2 className="text-xl font-semibold mb-4">My Shaders</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shaderList.map((shader) => (
            <RatingShaderCard
              key={shader.id}
              id={shader.id}
              title={shader.title}
              category={shader.category.name}
              average_rating={shader.average_rating}
            />
          ))}
        </div>
      </div>
    );
  },
);
UserShadersTab.displayName = "UserShadersTab";

export default async function ProfilePage() {
  // TODO hacer manejo de redirigir a login si no inició sesión

  const userShaders = await getUserShaders();

  const userData = (await getUserData())[0];
  const user = await getUser();

  const accountInfo: AccountInfoLine[] = [
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

            {/* task */}
            {/* TODO pulir UI */}
            {/* podría hasta ser una sidebar que sirva como menú y que de desplace a la sección que toques */}
            <div className="flex gap-4 mb-6">
              {/* TODO */}
              <Button variant="default">Account info</Button>
              {/* TODO */}
              <Button variant="default">My Shaders</Button>
            </div>
            {/* task */}

            <AccountInfoTab
              className="bg-black/50 rounded-2xl p-4 min-h-[300px] mb-3"
              lines={accountInfo}
            />

            <UserShadersTab
              className="bg-black/50 rounded-2xl p-4 min-h-[300px] mb-3"
              shaderList={userShaders}
            />
          </div>
        </div>
      </div>
    </>
  );
}
