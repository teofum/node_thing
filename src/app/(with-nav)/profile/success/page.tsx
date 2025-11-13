import { LinkButton } from "@/ui/button";
import { LuCheck } from "react-icons/lu";
import { getUserData } from "../actions/user";

export default async function SuccessPage() {
  const userData = await getUserData();
  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-6">
      <div className="glass glass-border p-8 rounded-2xl max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-green-400/20 flex items-center justify-center mx-auto mb-4">
          <LuCheck className="w-8 h-8 text-green-400" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Subscription Successful!</h1>
        <p className="text-white/60 mb-6">
          Your premium subscription is now active.
        </p>
        <LinkButton
          href={`/profile/${userData.username}`}
          variant="default"
          className="w-full"
        >
          Go to Profile
        </LinkButton>
      </div>
    </div>
  );
}
