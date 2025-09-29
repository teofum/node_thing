import { LinkButton } from "@/ui/button";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function SubscriptionSuccess() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_premium")
    .eq("id", user.id)
    .single();

  if (!profile?.is_premium) {
    redirect("/profile");
  }

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-6">
      <div className="glass glass-border p-8 rounded-2xl max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-white mb-4">
          Welcome to Premium!
        </h1>
        <p className="text-neutral-400 mb-8">
          Your subscription is now active.
        </p>

        <LinkButton href="/" variant="default" size="lg" className="w-full">
          Get Started
        </LinkButton>
      </div>
    </div>
  );
}
