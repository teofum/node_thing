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
    redirect("/marketplace/cart");
  }

  return (
    <div className="min-h-screen bg-neutral-900 relative">
      <LinkButton
        variant="ghost"
        href="/marketplace/cart"
        className="absolute top-4 left-4"
      >
        <LuArrowLeft />
        Back to Cart
      </LinkButton>

      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white">Checkout</h1>
          </div>

          <div className="bg-neutral-800 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-6">
              Order Summary
            </h2>

            <div className="mb-8">
              {order.order_items.map((item) => (
                <div
                  key={item.shader.id}
                  className="flex justify-between items-center py-4 border-b border-neutral-700 last:border-b-0 "
                >
                  <h3 className="text-white font-medium">
                    {item.shader.title}
                  </h3>
                  <span className="text-white font-medium">
                    ${item.price.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-neutral-700 pt-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-white">Total</span>
                <span className="text-lg font-bold text-white">
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
    </div>
  );
}
