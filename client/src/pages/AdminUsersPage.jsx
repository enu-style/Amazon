import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../services/api";

export default function AdminUsersPage() {
  const { user, token } = useSelector((state) => state.auth);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/admin/users", {
          params: { page, limit: 20, search: search.trim() || undefined },
        });
        const data = response.data?.data || {};
        setUsers(data.users || []);
        setPages(data.pagination?.pages || 0);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message || "Unable to load customers.",
        );
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [page, search, token, user?.role]);

  if (!token || !user || user.role !== "ADMIN") {
    return <Navigate to="/login" replace />;
  }

  const toggleCustomer = async (customer) => {
    setBusyId(customer.id);
    setError("");
    setMessage("");

    try {
      const isActive = !customer.isActive;
      await api.patch(`/admin/users/${customer.id}/status`, { isActive });
      setUsers((current) =>
        current.map((item) =>
          item.id === customer.id ? { ...item, isActive } : item,
        ),
      );
      setMessage(
        isActive
          ? "Customer account activated."
          : "Customer account deactivated.",
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to update customer status.",
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-7">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link
            to="/admin"
            className="text-sm font-medium text-orange-700 hover:text-orange-900"
          >
            Admin overview
          </Link>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
            Customers
          </h1>
        </div>
        <div className="flex gap-3">
          <Link
            to="/admin/products"
            className="rounded-md border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Products
          </Link>
          <Link
            to="/admin/orders"
            className="rounded-md border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Orders
          </Link>
        </div>
      </header>

      {(error || message) && (
        <p
          role={error ? "alert" : "status"}
          className={`rounded-md border px-4 py-3 text-sm ${
            error
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-emerald-200 bg-emerald-50 text-emerald-900"
          }`}
        >
          {error || message}
        </p>
      )}

      <section>
        <label className="grid max-w-xl gap-1.5 text-sm font-medium text-slate-700">
          Search customers
          <input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Name or email"
            className="rounded-md border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-orange-500"
          />
        </label>
      </section>

      <section className="overflow-x-auto border-y border-slate-200">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-3 py-3 font-medium">Customer</th>
              <th className="px-3 py-3 font-medium">Orders</th>
              <th className="px-3 py-3 font-medium">Joined</th>
              <th className="px-3 py-3 font-medium">Account</th>
              <th className="px-3 py-3 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-3 py-10 text-center text-slate-500"
                >
                  Loading customers...
                </td>
              </tr>
            ) : users.length ? (
              users.map((customer) => (
                <tr key={customer.id}>
                  <td className="px-3 py-3">
                    <p className="font-semibold text-slate-900">
                      {customer.firstName} {customer.lastName}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {customer.email}
                    </p>
                  </td>
                  <td className="px-3 py-3 text-slate-700">
                    {customer._count.orders}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-slate-600">
                    {new Date(customer.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={
                        customer.isActive
                          ? "text-emerald-700"
                          : "text-slate-500"
                      }
                    >
                      {customer.isActive ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => toggleCustomer(customer)}
                      disabled={busyId === customer.id}
                      className="font-medium text-orange-700 hover:text-orange-900 disabled:opacity-50"
                    >
                      {busyId === customer.id
                        ? "Saving..."
                        : customer.isActive
                          ? "Disable account"
                          : "Reactivate"}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="px-3 py-10 text-center text-slate-500"
                >
                  No customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="flex items-center justify-between border-t border-slate-200 px-3 py-3 text-sm text-slate-600">
          <span>
            Page {page} of {Math.max(pages, 1)}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((current) => current - 1)}
              className="rounded-md border border-slate-300 px-3 py-1.5 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= pages || loading}
              onClick={() => setPage((current) => current + 1)}
              className="rounded-md border border-slate-300 px-3 py-1.5 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
