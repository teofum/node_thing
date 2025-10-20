import { LinkButton } from "@/ui/button";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ orderId: string }>;
};

export const dynamic = "force-dynamic";

export default async function SuccessPage({ params }: Props) {
  const { orderId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: order } = await supabase
    .from("orders")
    .select("status")
    .eq("id", orderId)
    .eq("user_id", user.id)
    .single();

  if (!order) {
    redirect("/marketplace");
  }

  const isPending = order.status === "pending";

  return (
    <>
      {isPending && <meta httpEquiv="refresh" content="3" />}
      <div className="min-h-screen bg-neutral-900">
        <div className="flex items-center justify-center min-h-screen p-6">
          <div className="max-w-md mx-auto text-center">
            <div className="mb-6">
              {isPending ? (
                <>
                  <div className="mb-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
                  </div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    Processing Payment...
                  </h1>
                  <p className="text-neutral-400">
                    Please refresh the page in a few moments.
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-3xl font-bold text-white mb-2">Done!</h1>
                  <p className="text-neutral-400">
                    Your purchase has been completed.
                  </p>
                </>
              )}
            </div>

            <div className="space-y-3">
              <LinkButton href="/marketplace" className="w-full">
                Buy more shaders
              </LinkButton>
              <LinkButton href="/" variant="outline" className="w-full">
                Back to editor
              </LinkButton>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
