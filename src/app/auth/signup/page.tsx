import { signUpAction } from "@/lib/auth/actions";
import { OAuthButtons } from "@/app/auth/components/oauth-buttons";
import { Input } from "@/ui/input";
import { Button } from "@/ui/button";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

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
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-3xl font-bold">Create your account</h2>
      </div>

      <div className="glass glass-border p-6 w-96 mx-auto rounded-2xl">
        <OAuthButtons mode="signup" />

        <div className="font-medium mt-6 mb-3 text-center">
          or sign up using email
        </div>

        <form action={signUpAction} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm/3 font-semibold mb-2"
            >
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              className="w-full"
            />
          </div>
          <div>
            <label
              htmlFor="username"
              className="block text-sm/3 font-semibold mb-2"
            >
              Username
            </label>
            <Input
              id="username"
              name="username"
              type="text"
              required
              className="w-full"
            />
          </div>
          <div>
            <label
              htmlFor="displayName"
              className="block text-sm/3 font-semibold mb-2"
            >
              Display Name
            </label>
            <Input
              id="displayName"
              name="displayName"
              type="text"
              required
              className="w-full"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm/3 font-semibold mb-2"
            >
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              className="w-full"
            />
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm/3 font-semibold mb-2"
            >
              Confirm Password
            </label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              className="w-full"
            />
          </div>
          {params.error && (
            <p className="text-sm text-red-600">{params.error}</p>
          )}
          <Button
            type="submit"
            className="w-full p-2 bg-stone-800 text-white rounded hover:bg-blue-700 cursor-pointer"
          >
            Sign up
          </Button>
        </form>
      </div>

      <div className="text-center">
        <Link href="/auth/login" className="text-sm underline">
          Already have an account? Log in
        </Link>
      </div>
    </div>
  );
}
