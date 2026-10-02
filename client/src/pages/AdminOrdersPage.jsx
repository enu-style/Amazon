import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../services/api";

const statuses = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function AdminOrdersPage() {
  const { user, token } = useSelector((state) => state.auth);
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/admin/orders", {
          params: {
            page,
            limit: 20,
            ...(statusFilter ? { status: statusFilter } : {}),
          },
        });
        const data = response.data?.data || {};
        setOrders(data.orders || []);
        setPages(data.pagination?.pages || 0);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message || "Unable to load orders.",
        );
      } finally {
        setLoading(false);
      }
    };

    if (token && user?.role === "ADMIN") {
      fetchOrders();
    }
  }, [page, statusFilter, token, user?.role]);

  if (!token || !user || user.role !== "ADMIN") {
    return <Navigate to="/login" replace />;
  }

  const handleStatusChange = async (orderId, status) => {
    setUpdatingId(orderId);
    setError("");

    try {
      const response = await api.patch(`/admin/orders/${orderId}/status`, {
        status,
      });
      const data = response.data?.data;
      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: data.order.status,
                allowedStatuses: data.allowedStatuses,
              }
            : order,
        ),
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to update order status.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link
            to="/admin"
            className="text-sm font-medium text-orange-700 hover:text-orange-800"
          >
            Admin overview
          </Link>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
            Orders
          </h1>
        </div>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Filter by status
          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(1);
            }}
            className="min-w-44 rounded-md border border-slate-300 bg-white px-3 py-2"
          >
            <option value="">All orders</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </p>
      )}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Items</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Placed</th>
                <th className="px-4 py-3 font-medium">Fulfillment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-12 text-center text-slate-500"
                  >
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length ? (
                orders.map((order) => (
                  <tr key={order.id}>
                    <td className="whitespace-nowrap px-4 py-4 font-semibold text-slate-900">
                      {order.id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-slate-800">
                        {order.customer}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {order.email}
                      </p>
                    </td>
                    <td className="min-w-48 px-4 py-4 text-slate-600">
                      {order.items.map((item) => (
                        <p key={item.id}>
                          {item.quantity} x {item.product.name}
                        </p>
                      ))}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                      {order.paymentStatus}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 font-medium text-slate-900">
                      {currency.format(order.total)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4">
                      <select
                        aria-label={`Fulfillment status for order ${order.id}`}
                        value={order.status}
                        disabled={
                          !order.allowedStatuses.length ||
                          updatingId === order.id
                        }
                        onChange={(event) =>
                          handleStatusChange(order.id, event.target.value)
                        }
                        className="rounded-md border border-slate-300 bg-white px-2 py-2 text-xs disabled:bg-slate-100 disabled:text-slate-500"
                      >
                        <option value={order.status}>{order.status}</option>
                        {order.allowedStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-12 text-center text-slate-500"
                  >
                    No orders match this status.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm text-slate-600">
          <span>
            Page {page} of {Math.max(pages, 1)}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((current) => current - 1)}
              className="rounded-md border border-slate-300 px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= pages || loading}
              onClick={() => setPage((current) => current + 1)}
              className="rounded-md border border-slate-300 px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
