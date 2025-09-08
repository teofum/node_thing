import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LinkButton } from "@/ui/button";
import { LuArrowLeft } from "react-icons/lu";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/");
  }

  return (
    <div className="min-h-screen relative">
      <LinkButton variant="ghost" href="/" className="absolute top-4 left-4">
        <LuArrowLeft />
        Back
      </LinkButton>

      <div className="min-h-screen flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
