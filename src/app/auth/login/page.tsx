import { signInAction } from "../actions";
import { OAuthButtons } from "@/app/auth/components/oauth-buttons";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
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
        <h2 className="text-3xl font-bold">Welcome back!</h2>
      </div>

      <div className="glass glass-border p-6 w-96 mx-auto rounded-2xl">
        <OAuthButtons mode="signin" next={params.next} />

        <div className="font-medium mt-6 mb-3 text-center">
          or sign in using email or username
        </div>

        <form action={signInAction} className="space-y-6">
          {params.next && (
            <input type="hidden" name="next" value={params.next} />
          )}
          <div>
            <label
              htmlFor="emailOrUsername"
              className="block text-sm/3 font-semibold mb-2"
            >
              Email or Username
            </label>
            <Input
              id="emailOrUsername"
              name="emailOrUsername"
              type="text"
              required
              className="w-full"
            />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <label
                htmlFor="password"
                className="block text-sm/3 font-semibold"
              >
                Password
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-sm/3 hover:underline"
              >
                Forgot your password?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
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
            Log in
          </Button>
        </form>
      </div>

      <div className="text-center">
        <Link href="/auth/signup" className="text-sm underline">
          Don&apos;t have an account? Sign up
        </Link>
      </div>
    </div>
  );
}
