import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LinkButton, Button } from "@/ui/button";
import { LuArrowLeft, LuTrash2 } from "react-icons/lu";
import { removeFromCart, clearCart } from "@/lib/cart/actions";

export default async function CartPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/marketplace/cart");
  }

  const { data: cartItems } = await supabase
    .from("cart_items")
    .select(
      `
      shader_id,
      price_at_time,
      shader_title
    `,
    )
    .eq("user_id", user.id);

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
              <h1 className="text-3xl font-bold text-white">Cart</h1>
              {cartItems && cartItems.length > 0 && (
                <p className="text-neutral-400 mt-2">
                  {cartItems.length} {cartItems.length === 1 ? "item" : "items"}{" "}
                  in your cart
                </p>
              )}
            </div>
            {cartItems && cartItems.length > 0 && (
              <form action={clearCart}>
                <Button variant="outline" type="submit">
                  Clear Cart
                </Button>
              </form>
            )}
          </div>

          {!cartItems || cartItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-neutral-400 mb-4">Your cart is empty</p>
              <LinkButton href="/marketplace">Browse Shaders</LinkButton>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.shader_id}
                    className="glass glass-border p-4 rounded-lg"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-white font-semibold mb-2">
                          {item.shader_title}
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
                        <button
                          type="submit"
                          className="flex items-center justify-center w-10 h-10 rounded-md bg-red-600 hover:bg-red-700 transition-colors cursor-pointer"
                        >
                          <LuTrash2 className="text-white w-5 h-5" />
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>

              <div className="glass glass-border p-6 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-semibold text-white">
                    Total
                  </span>
                  <span className="text-3xl font-bold text-teal-400">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
