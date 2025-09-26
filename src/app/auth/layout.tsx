import { LinkButton } from "@/ui/button";
import { LuArrowLeft } from "react-icons/lu";
import { headers } from "next/headers";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const referer = headersList.get("referer");

  // if coming from marketplace, go back to marketplace
  const backUrl =
    referer && referer.includes("/marketplace") ? "/marketplace" : "/";

  return (
    <div className="min-h-screen relative">
      <LinkButton
        variant="ghost"
        href={backUrl}
        className="absolute top-4 left-4"
      >
        <LuArrowLeft />
        Back
      </LinkButton>

      <div className="min-h-screen flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
