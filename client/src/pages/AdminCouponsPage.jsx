import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../services/api";

const emptyDraft = {
  code: "",
  description: "",
  type: "PERCENTAGE",
  discountValue: "",
  minOrderAmount: "",
  maxDiscount: "",
  usageLimit: "",
  usagePerUser: "1",
  validFrom: "",
  validUntil: "",
};

export default function AdminCouponsPage() {
  const { user, token } = useSelector((state) => state.auth);
  const [coupons, setCoupons] = useState([]);
  const [draft, setDraft] = useState(emptyDraft);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [statistics, setStatistics] = useState(null);
  const [showStatsFor, setShowStatsFor] = useState(null);

  useEffect(() => {
    const loadCoupons = async () => {
      try {
        const statusParam = filterStatus !== "all" ? `status=${filterStatus}` : "";
        const response = await api.get(`/coupons?${statusParam}`);
        setCoupons(response.data?.data || []);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message || "Unable to load coupons.",
        );
      } finally {
        setLoading(false);
      }
    };

    if (token && user?.role === "ADMIN") {
      loadCoupons();
    }
  }, [token, user?.role, filterStatus]);

  if (!token || !user || user.role !== "ADMIN") {
    return <Navigate to="/login" replace />;
  }

  const updateDraft = (event) => {
    const { name, value } = event.target;
    setDraft((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const resetDraft = () => {
    setDraft(emptyDraft);
    setEditingId(null);
    setShowForm(false);
    setError("");
    setMessage("");
  };

  const editCoupon = (coupon) => {
    setEditingId(coupon.id);
    setDraft({
      code: coupon.code,
      description: coupon.description || "",
      type: coupon.type,
      discountValue: coupon.discountValue.toString(),
      minOrderAmount: coupon.minOrderAmount?.toString() || "",
      maxDiscount: coupon.maxDiscount?.toString() || "",
      usageLimit: coupon.usageLimit?.toString() || "",
      usagePerUser: coupon.usagePerUser.toString(),
      validFrom: coupon.validFrom ? new Date(coupon.validFrom).toISOString().slice(0, 16) : "",
      validUntil: coupon.validUntil ? new Date(coupon.validUntil).toISOString().slice(0, 16) : "",
    });
    setShowForm(true);
    setError("");
    setMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    const payload = {
      code: draft.code.trim().toUpperCase(),
      description: draft.description.trim() || undefined,
      type: draft.type,
      discountValue: parseFloat(draft.discountValue),
      minOrderAmount: draft.minOrderAmount ? parseFloat(draft.minOrderAmount) : undefined,
      maxDiscount: draft.maxDiscount ? parseFloat(draft.maxDiscount) : undefined,
      usageLimit: draft.usageLimit ? parseInt(draft.usageLimit) : undefined,
      usagePerUser: parseInt(draft.usagePerUser) || 1,
      validFrom: draft.validFrom || undefined,
      validUntil: draft.validUntil || undefined,
    };

    try {
      if (editingId) {
        const response = await api.put(`/coupons/${editingId}`, payload);
        const coupon = response.data?.data;
        setCoupons((current) =>
          current.map((item) =>
            item.id === editingId ? { ...item, ...coupon } : item,
          ),
        );
        setMessage("Coupon updated successfully.");
      } else {
        const response = await api.post("/coupons", payload);
        const coupon = response.data?.data;
        setCoupons((current) => [coupon, ...current]);
        setMessage("Coupon created successfully.");
      }
      resetDraft();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to save coupon.",
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (coupon) => {
    const newStatus = coupon.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    setBusyId(coupon.id);
    setError("");
    setMessage("");

    try {
      await api.put(`/coupons/${coupon.id}`, { status: newStatus });
      setCoupons((current) =>
        current.map((item) =>
          item.id === coupon.id ? { ...item, status: newStatus } : item,
        ),
      );
      setMessage(`Coupon ${newStatus === "ACTIVE" ? "activated" : "deactivated"}.`);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to update status.",
      );
    } finally {
      setBusyId(null);
    }
  };

  const deleteCoupon = async (coupon) => {
    if (!window.confirm(`Delete coupon "${coupon.code}"?`)) return;

    setBusyId(coupon.id);
    setError("");
    setMessage("");

    try {
      await api.delete(`/coupons/${coupon.id}`);
      setCoupons((current) => current.filter((item) => item.id !== coupon.id));
      setMessage("Coupon deleted.");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to delete coupon.",
      );
    } finally {
      setBusyId(null);
    }
  };

  const viewStatistics = async (couponId) => {
    try {
      const response = await api.get(`/coupons/${couponId}/statistics`);
      setStatistics(response.data?.data);
      setShowStatsFor(couponId);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to load statistics.",
      );
    }
  };

  const formatCouponType = (type) => {
    switch (type) {
      case "PERCENTAGE":
        return "Percentage";
      case "FIXED_AMOUNT":
        return "Fixed Amount";
      case "FREE_SHIPPING":
        return "Free Shipping";
      default:
        return type;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading coupons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Coupon Management</h1>
          <p className="mt-2 text-gray-600">
            Create and manage discount coupons for your store
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        {message && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
            {message}
          </div>
        )}

        {/* Actions Bar */}
        <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {showForm ? "Cancel" : "+ Create Coupon"}
            </button>
          </div>
          
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>
        </div>

        {/* Create/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {editingId ? "Edit Coupon" : "Create New Coupon"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Coupon Code *
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={draft.code}
                    onChange={updateDraft}
                    required
                    disabled={editingId}
                    placeholder="SUMMER20"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent uppercase"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Code will be converted to uppercase
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Type *
                  </label>
                  <select
                    name="type"
                    value={draft.type}
                    onChange={updateDraft}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED_AMOUNT">Fixed Amount ($)</option>
                    <option value="FREE_SHIPPING">Free Shipping</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    name="discountValue"
                    value={draft.discountValue}
                    onChange={updateDraft}
                    required
                    min="0"
                    step="0.01"
                    placeholder={draft.type === "PERCENTAGE" ? "20" : "10.00"}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {draft.type === "PERCENTAGE" ? "Enter percentage (0-100)" : "Enter dollar amount"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Order Amount
                  </label>
                  <input
                    type="number"
                    name="minOrderAmount"
                    value={draft.minOrderAmount}
                    onChange={updateDraft}
                    min="0"
                    step="0.01"
                    placeholder="50.00"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {draft.type === "PERCENTAGE" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Maximum Discount
                    </label>
                    <input
                      type="number"
                      name="maxDiscount"
                      value={draft.maxDiscount}
                      onChange={updateDraft}
                      min="0"
                      step="0.01"
                      placeholder="50.00"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Usage Limit
                  </label>
                  <input
                    type="number"
                    name="usageLimit"
                    value={draft.usageLimit}
                    onChange={updateDraft}
                    min="1"
                    placeholder="100"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-500">Leave empty for unlimited</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Usage Per User
                  </label>
                  <input
                    type="number"
                    name="usagePerUser"
                    value={draft.usagePerUser}
                    onChange={updateDraft}
                    required
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valid From
                  </label>
                  <input
                    type="datetime-local"
                    name="validFrom"
                    value={draft.validFrom}
                    onChange={updateDraft}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valid Until
                  </label>
                  <input
                    type="datetime-local"
                    name="validUntil"
                    value={draft.validUntil}
                    onChange={updateDraft}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={draft.description}
                    onChange={updateDraft}
                    rows="3"
                    placeholder="Summer sale - 20% off all items"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition-colors"
                >
                  {saving ? "Saving..." : editingId ? "Update Coupon" : "Create Coupon"}
                </button>
                <button
                  type="button"
                  onClick={resetDraft}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Coupons List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Discount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valid Until
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {coupons.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      No coupons found. Create your first coupon to get started!
                    </td>
                  </tr>
                ) : (
                  coupons.map((coupon) => (
                    <tr key={coupon.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {coupon.code}
                        </div>
                        {coupon.description && (
                          <div className="text-sm text-gray-500">
                            {coupon.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {formatCouponType(coupon.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">
                          {coupon.type === "PERCENTAGE" 
                            ? `${coupon.discountValue}%`
                            : coupon.type === "FIXED_AMOUNT"
                            ? `$${parseFloat(coupon.discountValue).toFixed(2)}`
                            : "Free Shipping"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {coupon.usedCount} / {coupon.usageLimit || "∞"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {coupon._count?.usages || 0} uses
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(coupon.validUntil)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            coupon.status === "ACTIVE"
                              ? "bg-green-100 text-green-800"
                              : coupon.status === "INACTIVE"
                              ? "bg-gray-100 text-gray-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {coupon.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => viewStatistics(coupon.id)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Statistics"
                          >
                            📊
                          </button>
                          <button
                            onClick={() => editCoupon(coupon)}
                            className="text-indigo-600 hover:text-indigo-900"
                            disabled={busyId === coupon.id}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => toggleStatus(coupon)}
                            className="text-yellow-600 hover:text-yellow-900"
                            disabled={busyId === coupon.id}
                          >
                            {coupon.status === "ACTIVE" ? "Deactivate" : "Activate"}
                          </button>
                          <button
                            onClick={() => deleteCoupon(coupon)}
                            className="text-red-600 hover:text-red-900"
                            disabled={busyId === coupon.id}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Statistics Modal */}
        {showStatsFor && statistics && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">
                    Coupon Statistics: {statistics.coupon.code}
                  </h2>
                  <button
                    onClick={() => {
                      setShowStatsFor(null);
                      setStatistics(null);
                    }}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Total Uses</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {statistics.statistics.totalUsages}
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Orders</div>
                    <div className="text-2xl font-bold text-green-600">
                      {statistics.statistics.totalOrders}
                    </div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Total Discount</div>
                    <div className="text-2xl font-bold text-purple-600">
                      ${statistics.statistics.totalDiscount.toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Revenue</div>
                    <div className="text-2xl font-bold text-indigo-600">
                      ${statistics.statistics.totalRevenue.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Recent Orders</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                            Order ID
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                            Customer
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                            Discount
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                            Total
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {statistics.recentOrders.map((order) => (
                          <tr key={order.id}>
                            <td className="px-4 py-2 text-sm">
                              #{order.id.slice(-8).toUpperCase()}
                            </td>
                            <td className="px-4 py-2 text-sm">
                              {order.user.firstName} {order.user.lastName}
                            </td>
                            <td className="px-4 py-2 text-sm text-green-600">
                              -${parseFloat(order.discount).toFixed(2)}
                            </td>
                            <td className="px-4 py-2 text-sm font-semibold">
                              ${parseFloat(order.total).toFixed(2)}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-500">
                              {formatDate(order.createdAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
