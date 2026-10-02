import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";

export default function OrdersPage() {
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingOrderId, setPayingOrderId] = useState(null);
  const [paymentError, setPaymentError] = useState("");

  const paymentResult = searchParams.get("payment");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get("/orders");
        setOrders(response.data?.data?.orders || []);
      } catch (error) {
        console.error("Failed to load orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const retryPayment = async (orderId) => {
    setPayingOrderId(orderId);
    setPaymentError("");

    try {
      const response = await api.post(`/orders/${orderId}/checkout-session`);
      const checkoutUrl = response.data?.data?.url;
      if (!checkoutUrl) {
        throw new Error("Stripe did not return a checkout URL.");
      }
      window.location.assign(checkoutUrl);
    } catch (error) {
      setPaymentError(
        error.response?.data?.message ||
          error.message ||
          "Unable to start payment. Please try again.",
      );
    } finally {
      setPayingOrderId(null);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center text-slate-500">
        Loading orders...
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-3xl font-bold tracking-tight">My orders</h1>

      {paymentResult === "success" && (
        <p className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Checkout returned successfully. Payment confirmation may take a moment
          to appear below.
        </p>
      )}
      {paymentResult === "cancelled" && (
        <p className="mt-5 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Payment was not completed. Your order is saved and you can retry
          checkout below.
        </p>
      )}
      {paymentError && (
        <p
          role="alert"
          className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {paymentError}
        </p>
      )}

      {orders.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600">
          No orders yet.
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-slate-200 p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    Order #{order.id.slice(-8)}
                  </p>
                  <p className="text-lg font-semibold text-slate-900">
                    ${Number(order.total || 0).toFixed(2)}
                  </p>
                </div>
                <div className="text-sm text-slate-600">
                  <p>Status: {order.status}</p>
                  <p>Payment: {order.paymentStatus}</p>
                  {order.paymentStatus !== "PAID" &&
                    order.status !== "CANCELLED" && (
                      <button
                        type="button"
                        onClick={() => retryPayment(order.id)}
                        disabled={payingOrderId === order.id}
                        className="mt-2 rounded-md bg-orange-500 px-3 py-1.5 font-semibold text-white disabled:opacity-60"
                      >
                        {payingOrderId === order.id
                          ? "Opening checkout..."
                          : "Pay now"}
                      </button>
                    )}
                </div>
              </div>

              <div className="mt-4 grid gap-2">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between text-sm text-slate-600"
                  >
                    <span>
                      {item.product.name} × {item.quantity}
                    </span>
                    <span>
                      ${(Number(item.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
