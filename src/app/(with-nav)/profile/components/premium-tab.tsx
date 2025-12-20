import { forwardRef } from "react";
import { Button } from "@/ui/button";
import { redirect } from "next/navigation";
import type { UserData } from "../actions/user";

type PremiumTabProps = {
  userData: UserData;
  user: { id: string };
} & React.HTMLAttributes<HTMLDivElement>;

const PremiumTab = forwardRef<HTMLDivElement, PremiumTabProps>(
  ({ userData, user, className, ...props }, forwardedRef) => {
    return (
      <div className={className} {...props} ref={forwardedRef}>
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Payment Settings</h2>
          <p className="text-white/60 text-sm mb-4">
            Connect your MercadoPago account to receive payments from shader
            sales
          </p>
          {userData.mpAccessToken ? (
            <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-green-400 font-medium">
                  MercadoPago Connected
                </span>
              </div>
              <p className="text-white/60 text-sm">
                You can now receive payments from shader sales
              </p>
            </div>
          ) : (
            <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-yellow-400 font-medium">
                  MercadoPago Not Connected
                </span>
              </div>
              <p className="text-white/60 text-sm mb-4">
                Connect your MercadoPago account to start selling shaders
              </p>
              <form
                action={async () => {
                  "use server";
                  const authUrl = `https://auth.mercadopago.com/authorization?${new URLSearchParams(
                    {
                      client_id: process.env.MP_APP_ID!,
                      response_type: "code",
                      platform_id: "mp",
                      state: user.id,
                      redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/mercadopago/callback`,
                    },
                  ).toString()}`;
                  redirect(authUrl);
                }}
              >
                <Button type="submit" size="lg" className="w-full">
                  Connect MercadoPago
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    );
  },
);
PremiumTab.displayName = "PremiumTab";

export default PremiumTab;
