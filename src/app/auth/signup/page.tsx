import { SignUpForm } from "@/app/auth/components/signup-form";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LinkButton } from "@/ui/button";
import { LuArrowLeft } from "react-icons/lu";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/");
  }

  const params = await searchParams;

  return (
    <div className="min-h-screen relative">
      <LinkButton variant="ghost" href="/" className="absolute top-4 left-4">
        <LuArrowLeft />
        Back
      </LinkButton>

      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Create your account</h2>
          </div>
          <SignUpForm error={params.error} />
          <div className="text-center">
            <Link href="/auth/login" className="text-sm underline">
              Already have an account? Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
