import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../services/api";

const emptyDraft = {
  name: "",
  slug: "",
  description: "",
  image: "",
  isActive: true,
};

export default function AdminCategoriesPage() {
  const { user, token } = useSelector((state) => state.auth);
  const [categories, setCategories] = useState([]);
  const [draft, setDraft] = useState(emptyDraft);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await api.get("/admin/categories");
        setCategories(response.data?.data?.categories || []);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message || "Unable to load categories.",
        );
      } finally {
        setLoading(false);
      }
    };

    if (token && user?.role === "ADMIN") {
      loadCategories();
    }
  }, [token, user?.role]);

  if (!token || !user || user.role !== "ADMIN") {
    return <Navigate to="/login" replace />;
  }

  const updateDraft = (event) => {
    const { name, value, type, checked } = event.target;
    setDraft((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetDraft = () => {
    setDraft(emptyDraft);
    setEditingId(null);
  };

  const editCategory = (category) => {
    setEditingId(category.id);
    setDraft({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      image: category.image || "",
      isActive: category.isActive,
    });
    setError("");
    setMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    const payload = {
      name: draft.name.trim(),
      slug: draft.slug.trim() || undefined,
      description: draft.description.trim() || null,
      image: draft.image.trim() || null,
      isActive: draft.isActive,
    };

    try {
      if (editingId) {
        const response = await api.put(`/categories/${editingId}`, payload);
        const category = response.data?.data?.category;
        setCategories((current) =>
          current.map((item) =>
            item.id === editingId ? { ...item, ...category } : item,
          ),
        );
        setMessage("Category updated.");
      } else {
        const response = await api.post("/categories", payload);
        const category = response.data?.data?.category;
        setCategories((current) =>
          [...current, { ...category, _count: { products: 0 } }].sort(
            (left, right) => left.name.localeCompare(right.name),
          ),
        );
        setMessage("Category created.");
      }
      resetDraft();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to save this category.",
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleCategory = async (category) => {
    setBusyId(category.id);
    setError("");
    setMessage("");

    try {
      const response = await api.put(`/categories/${category.id}`, {
        isActive: !category.isActive,
      });
      const updated = response.data?.data?.category;
      setCategories((current) =>
        current.map((item) =>
          item.id === category.id ? { ...item, ...updated } : item,
        ),
      );
      setMessage(
        updated.isActive
          ? "Category published."
          : "Category hidden from the storefront.",
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to change category status.",
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
            Categories
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

      <section className="border-b border-slate-200 pb-8">
        <h2 className="text-xl font-bold text-slate-900">
          {editingId ? "Edit category" : "Add category"}
        </h2>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
              Name
              <input
                name="name"
                value={draft.name}
                onChange={updateDraft}
                minLength={2}
                maxLength={80}
                required
                className="rounded-md border border-slate-300 px-3 py-2.5 outline-none focus:border-orange-500"
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
              URL slug
              <input
                name="slug"
                value={draft.slug}
                onChange={updateDraft}
                minLength={2}
                maxLength={80}
                placeholder="Generated from category name"
                className="rounded-md border border-slate-300 px-3 py-2.5 outline-none focus:border-orange-500"
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-slate-700 sm:col-span-2">
              Description
              <textarea
                name="description"
                value={draft.description}
                onChange={updateDraft}
                maxLength={500}
                rows={3}
                className="rounded-md border border-slate-300 px-3 py-2.5 outline-none focus:border-orange-500"
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-slate-700 sm:col-span-2">
              Image URL
              <input
                name="image"
                type="url"
                value={draft.image}
                onChange={updateDraft}
                className="rounded-md border border-slate-300 px-3 py-2.5 outline-none focus:border-orange-500"
              />
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 sm:col-span-2">
              <input
                type="checkbox"
                name="isActive"
                checked={draft.isActive}
                onChange={updateDraft}
              />
              Published in storefront
            </label>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Save changes"
                  : "Create category"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetDraft}
                className="rounded-md border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700"
              >
                Cancel edit
              </button>
            )}
          </div>
        </form>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-slate-900">All categories</h2>
          <span className="text-sm text-slate-500">
            {categories.length} total
          </span>
        </div>
        <div className="overflow-x-auto border-y border-slate-200">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-3 py-3 font-medium">Category</th>
                <th className="px-3 py-3 font-medium">Slug</th>
                <th className="px-3 py-3 font-medium">Products</th>
                <th className="px-3 py-3 font-medium">Visibility</th>
                <th className="px-3 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-3 py-10 text-center text-slate-500"
                  >
                    Loading categories...
                  </td>
                </tr>
              ) : categories.length ? (
                categories.map((category) => (
                  <tr key={category.id}>
                    <td className="px-3 py-3">
                      <p className="font-semibold text-slate-900">
                        {category.name}
                      </p>
                      {category.description && (
                        <p className="mt-1 max-w-lg text-xs text-slate-500">
                          {category.description}
                        </p>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-slate-600">
                      {category.slug}
                    </td>
                    <td className="px-3 py-3 text-slate-700">
                      {category._count?.products || 0}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={
                          category.isActive
                            ? "text-emerald-700"
                            : "text-slate-500"
                        }
                      >
                        {category.isActive ? "Published" : "Hidden"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => editCategory(category)}
                        className="mr-3 font-medium text-orange-700 hover:text-orange-900"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleCategory(category)}
                        disabled={busyId === category.id}
                        className="font-medium text-slate-700 hover:text-slate-900 disabled:opacity-50"
                      >
                        {busyId === category.id
                          ? "Saving..."
                          : category.isActive
                            ? "Deactivate"
                            : "Publish"}
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
                    No categories found.
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
