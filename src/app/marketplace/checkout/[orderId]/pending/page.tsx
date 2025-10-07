import { LinkButton } from "@/ui/button";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ orderId: string }>;
};

export const dynamic = "force-dynamic";

export default async function PendingPage({ params }: Props) {
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

  if (order.status === "completed") {
    redirect(`/marketplace/checkout/${orderId}/success`);
  }

  if (order.status === "pending") {
    await supabase.rpc("finish_payment", {
      order_uuid: orderId,
      user_uuid: user.id,
    });
  }

  return (
    <div className="min-h-screen bg-neutral-900">
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-6">
            <div className="mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Processing Payment...
            </h1>
          </div>

          <div className="space-y-3">
            <LinkButton href="/marketplace" className="w-full">
              Buy more shaders
            </LinkButton>
            <LinkButton href="/" variant="outline" className="w-full">
              Back to Editor
            </LinkButton>
          </div>
        </div>
      </div>
    </div>
  );
}
