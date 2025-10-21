import { LinkButton, Button } from "@/ui/button";
import { LuArrowLeft } from "react-icons/lu";
import { getOrderDetails, createMercadoPagoCheckout } from "../actions";
import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function CheckoutPage({ params, searchParams }: Props) {
  const { orderId } = await params;
  const { error } = await searchParams;
  const order = await getOrderDetails(orderId);

  if (order.status !== "pending") {
    redirect("/marketplace");
  }

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-row items-center mb-8">
          <h1 className="text-3xl font-bold grow">Checkout</h1>
          <LinkButton variant="ghost" href="/marketplace">
            <LuArrowLeft />
            Back to Marketplace
          </LinkButton>
        </div>

        <div className="border border-white/15 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

          <div className="mb-8">
            {order.order_items.map((item, index) => {
              const title = item.shader?.title || item.project?.name;
              const itemId = item.shader?.id || item.project?.id || index;
              const itemType =
                item.item_type || (item.shader ? "shader" : "project");

              return (
                <div
                  key={itemId}
                  className="flex justify-between items-center py-4 border-b border-white/15 last:border-b-0 "
                >
                  <h3 className="font-medium">
                    {title}{" "}
                    <span className="text-sm text-white/60">({itemType})</span>
                  </h3>
                  <span className="font-medium">${item.price.toFixed(2)}</span>
                </div>
              );
            })}
          </div>

          <div className="border-t border-white/15 pt-6">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-lg font-bold">
                ${order.total_amount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form
          action={createMercadoPagoCheckout.bind(null, orderId)}
          className="space-y-4"
        >
          <Button type="submit" size="lg" className="w-full">
            Proceed to Payment
          </Button>
        </form>
      </div>
    </div>
  );
}
