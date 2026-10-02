import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function CartPage() {
  const [cart, setCart] = useState({
    items: [],
    subtotal: 0,
    shippingFee: 0,
    total: 0,
    itemCount: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      const response = await api.get("/cart");
      const payload = response.data?.data?.cart ||
        response.data?.cart || {
          items: [],
          subtotal: 0,
          shippingFee: 0,
          total: 0,
          itemCount: 0,
        };
      setCart(payload);
    } catch (error) {
      console.error("Failed to load cart:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return;

    try {
      await api.put(`/cart/items/${itemId}`, { quantity });
      fetchCart();
    } catch (error) {
      console.error("Failed to update quantity:", error);
    }
  };

  const removeItem = async (itemId) => {
    try {
      await api.delete(`/cart/items/${itemId}`);
      fetchCart();
    } catch (error) {
      console.error("Failed to remove item:", error);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center text-slate-500">
        Loading cart...
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.5fr_0.7fr]">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Your cart</h1>
          <span className="text-sm text-slate-500">{cart.itemCount} items</span>
        </div>

        {cart.items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <p className="mb-3 text-lg font-semibold text-slate-800">
              Your cart is empty
            </p>
            <Link
              to="/products"
              className="inline-block rounded-xl bg-orange-500 px-4 py-2.5 font-semibold text-white"
            >
              Continue shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {cart.items.map((item) => {
              const product = item.product;
              const image =
                product.images?.[0]?.url ||
                "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80";
              const unitPrice = Number(product.discountPrice || product.price);

              return (
                <div
                  key={item.id}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 sm:flex-row"
                >
                  <img
                    src={image}
                    alt={product.name}
                    className="h-28 w-full rounded-xl object-cover sm:w-28"
                  />
                  <div className="flex-1">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row">
                      <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                          {product.name}
                        </h2>
                        <p className="text-sm text-slate-500">
                          {product.brand}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-sm font-medium text-red-500"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center rounded-xl border border-slate-200">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="px-3 py-2 text-lg"
                        >
                          −
                        </button>
                        <span className="min-w-10 text-center text-sm font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="px-3 py-2 text-lg"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-xl font-bold text-slate-900">
                          ${(unitPrice * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-sm text-slate-500">
                          ${unitPrice.toFixed(2)} each
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Summary</h2>
        <div className="mt-5 space-y-3 text-sm text-slate-600">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${Number(cart.subtotal || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>${Number(cart.shippingFee || 0).toFixed(2)}</span>
          </div>
          <div className="border-t border-slate-200 pt-3 flex justify-between text-lg font-bold text-slate-900">
            <span>Total</span>
            <span>${Number(cart.total || 0).toFixed(2)}</span>
          </div>
        </div>

        <Link
          to="/checkout"
          className="mt-6 block w-full rounded-xl bg-orange-500 px-4 py-3 text-center font-semibold text-white hover:bg-orange-600"
        >
          Proceed to checkout
        </Link>
      </aside>
    </div>
  );
}
