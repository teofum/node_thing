import { forwardRef } from "react";
import { Button } from "@/ui/button";
import type { User } from "@supabase/supabase-js";
import AccountEditor from "../dialogs/change-username";
import DisplayNameEditor from "../dialogs/change-displayname";
import PasswordEditor from "../dialogs/change-password";
import type { UserData } from "../page";

type SettingsTabProps = {
  userData: UserData;
  user: User;
} & React.HTMLAttributes<HTMLDivElement>;

const SettingsTab = forwardRef<HTMLDivElement, SettingsTabProps>(
  ({ userData, user, className, ...props }, forwardedRef) => {
    return (
      <div className={className} {...props} ref={forwardedRef}>
        <div className="flex flex-col gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-6">Account Settings</h2>

            {/* Profile Information */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                  <div>
                    <p className="font-medium">Username</p>
                    <p className="text-sm text-neutral-400">
                      @{userData.username}
                    </p>
                  </div>
                  <AccountEditor
                    trigger={
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                    }
                    title="Edit Username"
                    userData={userData}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                  <div>
                    <p className="font-medium">Display Name</p>
                    <p className="text-sm text-neutral-400">
                      {userData.displayName || "Not set"}
                    </p>
                  </div>
                  <DisplayNameEditor
                    trigger={
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                    }
                    currentDisplayName={userData.displayName || ""}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-neutral-800/50 rounded-lg border border-white/5">
                <div>
                  <p className="font-medium text-neutral-400">Email</p>
                  <p className="text-sm text-neutral-500">{user.email!}</p>
                </div>
                <p className="text-xs text-neutral-500">Cannot be changed</p>
              </div>

              {user.app_metadata.provider === "email" && (
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                  <div>
                    <p className="font-medium">Password</p>
                  </div>
                  <PasswordEditor
                    trigger={
                      <Button size="sm" variant="outline">
                        Change
                      </Button>
                    }
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },
);
SettingsTab.displayName = "SettingsTab";

export default SettingsTab;
