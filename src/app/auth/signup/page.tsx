import { SignUpForm } from "@/app/auth/components/signup-form";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LinkButton } from "@/ui/button";
import { LuArrowLeft } from "react-icons/lu";

export default async function SignUpPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

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
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Create your account</h2>
          </div>
          <SignUpForm />
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
