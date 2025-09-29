import { subscribePremiumAction, cancelSubscriptionAction } from "./actions";
import { getStripePrices, getStripeProducts } from "@/lib/payments/stripe";
import { LinkButton } from "@/ui/button";
import { Button } from "@/ui/button";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

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

  const [prices, products] = await Promise.all([
    getStripePrices(),
    getStripeProducts(),
  ]);

  const premiumPlan = products.find(
    (product) => product.name === "Premium Subscription",
  );
  const premiumPrice = prices.find(
    (price) => price.productId === premiumPlan?.id,
  );

  return (
    <div className="min-h-screen bg-neutral-900 relative">
      <LinkButton
        variant="ghost"
        href="/"
        size="md"
        className="absolute top-4 left-4"
      >
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
                    <form action={subscribePremiumAction}>
                      <input
                        type="hidden"
                        name="price_id"
                        value={premiumPrice?.id}
                      />
                      <Button
                        type="submit"
                        variant="default"
                        size="lg"
                        className="w-full"
                      >
                        Renew Subscription
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
                {premiumPrice ? (
                  <form action={subscribePremiumAction}>
                    <input
                      type="hidden"
                      name="price_id"
                      value={premiumPrice.id}
                    />
                    <Button
                      type="submit"
                      variant="default"
                      size="lg"
                      className="w-full"
                    >
                      Subscribe to Premium - $
                      {(premiumPrice.unitAmount || 0) / 100}/
                      {premiumPrice.interval}
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
