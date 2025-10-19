import { forwardRef } from "react";
import { IconType } from "react-icons/lib";
import { LuCloudUpload, LuGem, LuGlobe, LuSparkles } from "react-icons/lu";
import { Button } from "@/ui/button";
import {
  cancelSubscriptionAction,
  resumeSubscriptionAction,
  subscribePremiumAction,
} from "../actions/subscription";
import type { UserData } from "../page";

type IconTextLine = { id: string; icon: IconType; text: string };

type PremiumTabProps = {
  userData: UserData;
} & React.HTMLAttributes<HTMLDivElement>;

const PremiumTab = forwardRef<HTMLDivElement, PremiumTabProps>(
  ({ userData, className, ...props }, forwardedRef) => {
    const featureList: IconTextLine[] = [
      {
        id: "cloud",
        icon: LuCloudUpload,
        text: "Save your projects on the cloud",
      },
      {
        id: "publish",
        icon: LuGlobe,
        text: "Publish and sell shaders on the marketplace",
      },
      {
        id: "ai",
        icon: LuSparkles,
        text: "Generate shaders with AI (WIP)",
      },
    ];

    const variantId = process.env.LEMONSQUEEZY_PREMIUM_VARIANT_ID;

    return (
      <div className={className} {...props} ref={forwardedRef}>
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Premium Subscription</h2>
          {userData.isPremium ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <p>You are a premium user</p>
                <LuGem />
                <p>Thank you for your support!</p>
              </div>
              <p className="text-neutral-400">
                {userData.cancelled
                  ? "Subscription valid until period end"
                  : "Subscription renews automatically"}
              </p>
              {userData.cancelled ? (
                <form action={resumeSubscriptionAction}>
                  <Button type="submit" size="lg" className="w-full">
                    Resume Subscription
                  </Button>
                </form>
              ) : (
                <form action={cancelSubscriptionAction}>
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
          ) : (
            <div className="flex flex-col gap-4">
              <p>Gain access to exclusive features with the premium version!</p>
              <div>
                {featureList.map(({ id, icon: Icon, text }) => (
                  <div className="flex items-center gap-2" key={id}>
                    <Icon /> {text}
                  </div>
                ))}
              </div>
              {variantId ? (
                <form action={subscribePremiumAction}>
                  <input type="hidden" name="variant_id" value={variantId} />
                  <Button type="submit" size="lg" className="w-full">
                    Get Started
                    <LuGem />
                  </Button>
                </form>
              ) : (
                <p className="text-red-400">Premium plan not available</p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  },
);
PremiumTab.displayName = "PremiumTab";

export default PremiumTab;
