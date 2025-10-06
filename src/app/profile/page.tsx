import {
  subscribePremiumAction,
  cancelSubscriptionAction,
  resumeSubscriptionAction,
  updatePayoutSettingsAction,
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
    .select("is_premium, subscription_id, cancelled, mp_email, pending_balance")
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

          <div className="glass glass-border p-6 rounded-2xl mt-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Payout Settings
            </h2>
            <p className="text-neutral-400 text-sm mb-4">
              Configure your Mercado Pago email to receive payments from shader
              sales
            </p>

            <form action={updatePayoutSettingsAction}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Mercado Pago Email
                </label>
                <input
                  type="email"
                  name="mp_email"
                  defaultValue={profile?.mp_email || ""}
                  placeholder="tu@email.com"
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-neutral-500"
                />
              </div>

              <div className="bg-neutral-800 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-300">Pending earnings:</span>
                  <span className="text-xl font-bold text-teal-400">
                    ${(profile?.pending_balance || 0).toFixed(2)} ARS
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-2">
                  Paid weekly via Mercado Pago
                </p>
              </div>

              <Button
                type="submit"
                variant="default"
                size="lg"
                className="w-full"
              >
                Save Payout Settings
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
