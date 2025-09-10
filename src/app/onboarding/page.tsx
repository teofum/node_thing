import { onboardingAction } from "@/lib/auth/actions";
import { Input } from "@/ui/input";
import { Button } from "@/ui/button";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Check if user already has a profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  if (profile) {
    const params = await searchParams;
    const next = params.next;
    if (next && next.startsWith("/")) {
      redirect(next);
    } else {
      redirect("/");
    }
  }

  const params = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Choose your username</h2>
          <p className="text-sm">
            Welcome! Please choose a username to complete your account setup.
          </p>
        </div>

        <div className="glass glass-border p-6 w-96 mx-auto rounded-2xl">
          <form action={onboardingAction} className="space-y-6">
            {params.next && (
              <input type="hidden" name="next" value={params.next} />
            )}
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
            {params.error && (
              <p className="text-sm text-red-600">{params.error}</p>
            )}
            <Button
              type="submit"
              className="w-full p-2 bg-stone-800 text-white rounded hover:bg-blue-700 cursor-pointer"
            >
              Complete Setup
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
