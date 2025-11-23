"use client";

import { LuArrowRight, LuShoppingCart, LuTrash2, LuX } from "react-icons/lu";
import { startTransition, useActionState } from "react";

import { Button } from "@/ui/button";
import { Popover } from "@/ui/popover";
import { clearCart, getCartItems, removeFromCart } from "../cart.actions";
import { createOrderAndRedirect } from "../checkout/actions";

type CartProps = {
  items: Awaited<ReturnType<typeof getCartItems>>;
};

export function Cart({ items }: CartProps) {
  const [clearCartStatus, clearCartAction, clearCartPending] = useActionState(
    async () => {
      await clearCart();
      return null;
    },
    null,
  );

  // TODO pending behaviour
  const [removeFromCartState, removeFromCartAction, removeFromCartPending] =
    useActionState(async (_prev: null, formData: FormData) => {
      await removeFromCart(formData);
      return null;
    }, null);

  // TODO pending behaviour
  const [
    createOrderAndRedirectStatus,
    createOrderAndRedirectAction,
    createOrderAndRedirectPending,
  ] = useActionState(async () => {
    await createOrderAndRedirect();
    return null;
  }, null);

  if (!items.length) return null;

  return (
    <Popover
      trigger={
        <Button variant="outline" className="relative">
          <LuShoppingCart />
          Cart
          <div className="absolute -top-1 -right-1 grid place-items-center text-xs/3 w-4 h-4 rounded-full bg-teal-800 border border-teal-300 text-teal-300">
            {items.length}
          </div>
        </Button>
      }
      sideOffset={4}
      collisionPadding={16}
      align="end"
    >
      <div className="flex flex-row items-center text-base/4 font-semibold border-b border-white/15 p-2 pl-4">
        <div>Cart ({items.length} items)</div>
        <form
          action={() => startTransition(() => clearCartAction())}
          className="ml-auto"
        >
          <Button variant="ghost" type="submit" className="text-red-400">
            <LuX />
            Clear
          </Button>
        </form>
      </div>
      <div className="grid grid-cols-[minmax(12rem,1fr)_auto_auto] gap-x-3">
        {items.map((item) => {
          const title = item.shader?.title || item.project?.name;
          const itemId = item.shader_id || item.project_id;
          const itemType =
            item.item_type || (item.shader_id ? "shader" : "project");

          return (
            <div
              key={itemId}
              className="grid col-start-1 -col-end-1 grid-cols-subgrid items-center text-sm/4 border-b border-white/15 p-2"
            >
              <div className="font-medium pl-2">{title}</div>
              <div className="font-semibold text-white/60 text-end">
                $ {item.price_at_time.toFixed(2)}
              </div>
              <form
                action={(formData) =>
                  startTransition(() => removeFromCartAction(formData))
                }
              >
                <input type="hidden" name="itemId" value={itemId!} />
                <input type="hidden" name="itemType" value={itemType} />
                <Button
                  type="submit"
                  variant="ghost"
                  className="text-red-400"
                  icon
                >
                  <LuTrash2 />
                </Button>
              </form>
            </div>
          );
        })}
        <div className="p-2 grid col-start-1 -col-end-1 grid-cols-subgrid gap-y-2">
          <div className="font-medium pl-2">Total</div>
          <div className="font-semibold text-green-400 text-end">
            ${" "}
            {items
              .reduce((total, item) => total + item.price_at_time, 0)
              .toFixed(2)}
          </div>
          <form
            action={() => startTransition(() => createOrderAndRedirectAction())}
            className="col-start-1 -col-end-1"
          >
            <Button type="submit" size="lg" className="w-full">
              Proceed to Checkout
              <LuArrowRight />
            </Button>
          </form>
        </div>
      </div>
    </Popover>
  );
}
