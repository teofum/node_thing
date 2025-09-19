import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LinkButton, Button } from "@/ui/button";
import { LuArrowLeft, LuTrash2, LuEraser } from "react-icons/lu";
import { removeFromCart, clearCart, getCartItems } from "./actions";
import { createOrderAndRedirect } from "../checkout/actions";

export default async function CartPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/marketplace/cart");
  }

  const cartItems = await getCartItems();

  const total =
    cartItems?.reduce((sum, item) => sum + item.price_at_time, 0) || 0;

  return (
    <div className="min-h-screen bg-neutral-900 relative">
      <LinkButton
        variant="ghost"
        href="/marketplace"
        className="absolute top-4 left-4"
      >
        <LuArrowLeft />
        Back to Marketplace
      </LinkButton>

      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                Cart
              </h1>
              {cartItems.length > 0 && (
                <p className="text-neutral-400 mt-2">
                  {cartItems.length} {cartItems.length === 1 ? "item" : "items"}{" "}
                  in your cart
                </p>
              )}
            </div>
            {cartItems.length > 0 && (
              <form action={clearCart}>
                <Button
                  variant="outline"
                  size="lg"
                  type="submit"
                  className="text-red-400"
                  icon
                >
                  <LuEraser />
                  Clear Cart
                </Button>
              </form>
            )}
          </div>

          {cartItems.length === 0 ? (
            <div className="text-center py-12 ">
              <p className="text-neutral-400 mb-8">Your cart is empty!</p>
              <LinkButton
                href="/marketplace"
                type="submit"
                variant="default"
                size="lg"
              >
                Browse Shaders
              </LinkButton>
            </div>
          ) : (
            <div className="space-y-6 glass glass-border p-6 rounded-xl ">
              <div className="space-y-1 ">
                {cartItems.map((item) => (
                  <div key={item.shader_id} className="border-b py-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-white font-semibold mb-3">
                          {item.shader?.title}
                        </h3>
                        <p className="text-teal-400 font-bold">
                          ${item.price_at_time}
                        </p>
                      </div>
                      <form action={removeFromCart}>
                        <input
                          type="hidden"
                          name="shaderId"
                          value={item.shader_id}
                        />
                        <Button
                          type="submit"
                          variant="outline"
                          size="lg"
                          className="text-red-400"
                          icon
                        >
                          <LuTrash2 className="text-white w-5 h-5" />
                        </Button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xl font-semibold text-white">
                    Total
                  </span>
                  <span className="text-3xl font-bold text-teal-400">
                    ${total.toFixed(2)}
                  </span>
                </div>
                <form action={createOrderAndRedirect}>
                  <Button
                    type="submit"
                    variant="outline"
                    size="lg"
                    className="w-full"
                  >
                    Proceed to Checkout
                  </Button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
