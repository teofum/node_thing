import { LoginForm } from "@/components/auth/login-form";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function LoginPage() {
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
          <h2 className="text-3xl font-bold">Welcome back!</h2>
        </div>
        <LoginForm />
        <div className="text-center">
          <Link href="/auth/signup" className="text-sm underline">
            Don&apos;t have an account? Sign up
          </Link>
        </div>
      </div>
    </div>
    </div>
  );
}