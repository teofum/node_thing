import {
  subscribePremiumAction,
  cancelSubscriptionAction,
  resumeSubscriptionAction,
} from "./actions";
import { LinkButton } from "@/ui/button";
import { Button } from "@/ui/button";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LuArrowLeft } from "react-icons/lu";

export const revalidate = 3600;

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_premium, subscription_id, cancelled")
    .eq("id", user.id)
    .single();

  const variantId = process.env.LEMONSQUEEZY_PREMIUM_VARIANT_ID;

  return (
    <div className="min-h-screen bg-neutral-900 relative">
      <LinkButton variant="ghost" href="/" className="absolute top-4 left-4">
        <LuArrowLeft />
        Back
      </LinkButton>

      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white">Profile</h1>
          </div>

          <div className="glass glass-border p-6 rounded-2xl">
            <h2 className="text-xl font-semibold text-white mb-4">
              Premium Subscription
            </h2>

            {profile?.is_premium ? (
              <div>
                <p className="text-neutral-400 mb-6">
                  {profile.cancelled
                    ? "Subscription valid until period end"
                    : "Subscription renews automatically"}
                </p>
                <div className="space-y-3">
                  {profile.cancelled ? (
                    <form action={resumeSubscriptionAction}>
                      <Button
                        type="submit"
                        variant="default"
                        size="lg"
                        className="w-full"
                      >
                        Resume Subscription
                      </Button>
                    </form>
                  ) : (
                    <form action={cancelSubscriptionAction}>
                      {/* TODO: Add confirmation dialog "Are you sure you want to cancel?" */}
                      <Button
                        type="submit"
                        variant="outline"
                        size="lg"
                        className="w-full text-red-400 border-red-400 hover:bg-red-400/10"
                      >
                        Cancel Subscription
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            ) : (
              <div>
                {variantId ? (
                  <form action={subscribePremiumAction}>
                    <input type="hidden" name="variant_id" value={variantId} />
                    <Button
                      type="submit"
                      variant="default"
                      size="lg"
                      className="w-full"
                    >
                      Subscribe to Premium
                    </Button>
                  </form>
                ) : (
                  <p className="text-red-400">Premium plan not available</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
