import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../services/api";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function AdminDashboardPage() {
  const { user, token } = useSelector((state) => state.auth);
  const [overview, setOverview] = useState({
    totalProducts: 0,
    totalCustomers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    lowStockCount: 0,
    pendingOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const response = await api.get("/admin/overview");
        const payload = response.data?.data || {};
        setOverview(payload.overview || overview);
        setRecentOrders(payload.recentOrders || []);
      } catch (error) {
        console.error("Failed to load admin overview:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token && user?.role === "ADMIN") {
      fetchOverview();
    }
  }, [token, user?.role]);

  if (!token || !user || user.role !== "ADMIN") {
    return <Navigate to="/login" replace />;
  }

  const summaryCards = [
    { label: "Total products", value: overview.totalProducts },
    { label: "Customers", value: overview.totalCustomers },
    { label: "Orders", value: overview.totalOrders },
    { label: "Revenue", value: currency.format(overview.totalRevenue) },
    { label: "Low stock", value: overview.lowStockCount },
    { label: "Pending orders", value: overview.pendingOrders },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-orange-600">
            Dashboard
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
            Admin overview
          </h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/admin/products"
            className="rounded-md bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-700"
          >
            Manage products
          </Link>
          <Link
            to="/admin/orders"
            className="rounded-md border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Manage orders
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-2xl bg-slate-200"
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm text-slate-500">{card.label}</p>
              <p className="mt-4 text-3xl font-black text-slate-900">
                {card.value}
              </p>
            </div>
          ))}
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Recent orders</h2>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-600">
              <tr>
                <th className="pb-3 pr-4 font-medium">Order</th>
                <th className="pb-3 pr-4 font-medium">Customer</th>
                <th className="pb-3 pr-4 font-medium">Status</th>
                <th className="pb-3 pr-4 font-medium">Total</th>
                <th className="pb-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length ? (
                recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-slate-100">
                    <td className="py-3 pr-4 font-medium text-slate-900">
                      {order.id.slice(0, 10)}
                    </td>
                    <td className="py-3 pr-4 text-slate-600">
                      {order.customer}
                    </td>
                    <td className="py-3 pr-4">
                      <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-700">
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-medium text-slate-900">
                      {currency.format(order.total)}
                    </td>
                    <td className="py-3 text-slate-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-500">
                    No orders have been placed yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
