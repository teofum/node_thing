import { SignUpForm } from "@/components/auth/signup-form";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function SignUpPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  if (user) {
    redirect("/");
  }
  return (
    <div className="min-h-screen relative">
      <Link href="/" className="absolute top-4 left-4 p-2 hover:bg-gray-100 rounded">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>
      </Link>
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Sign up</h2>
        </div>
        <SignUpForm />
        <div className="text-center">
          <Link href="/auth/login" className="text-sm underline">
            Already have an account? Login
          </Link>
        </div>
      </div>
    </div>
    </div>
  );
}