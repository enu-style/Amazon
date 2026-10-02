import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../services/api";

const emptyDraft = {
  name: "",
  description: "",
  price: "",
  discountPrice: "",
  stock: "0",
  sku: "",
  brand: "",
  categoryId: "",
  images: "",
  isActive: true,
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function AdminProductsPage() {
  const { user, token } = useSelector((state) => state.auth);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [draft, setDraft] = useState(emptyDraft);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyProductId, setBusyProductId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const [productResponse, categoryResponse] = await Promise.all([
          api.get("/admin/products"),
          api.get("/categories"),
        ]);
        setProducts(productResponse.data?.data?.products || []);
        setCategories(categoryResponse.data?.data?.categories || []);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message || "Unable to load the catalog.",
        );
      } finally {
        setLoading(false);
      }
    };

    if (token && user?.role === "ADMIN") {
      loadCatalog();
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
    setDraft({ ...emptyDraft, categoryId: categories[0]?.id || "" });
    setEditingId(null);
  };

  const editProduct = (product) => {
    setEditingId(product.id);
    setDraft({
      name: product.name,
      description: product.description,
      price: String(product.price),
      discountPrice: product.discountPrice ? String(product.discountPrice) : "",
      stock: String(product.stock),
      sku: product.sku,
      brand: product.brand,
      categoryId: product.categoryId,
      images: product.images.map((image) => image.url).join("\n"),
      isActive: product.isActive,
    });
    setMessage("");
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    const payload = {
      name: draft.name.trim(),
      description: draft.description.trim(),
      price: Number(draft.price),
      discountPrice:
        draft.discountPrice === "" ? null : Number(draft.discountPrice),
      stock: Number(draft.stock),
      sku: draft.sku.trim(),
      brand: draft.brand.trim(),
      categoryId: draft.categoryId,
      images: draft.images
        .split("\n")
        .map((url) => url.trim())
        .filter(Boolean),
      ...(editingId
        ? { isActive: draft.isActive }
        : { isActive: draft.isActive }),
    };

    try {
      if (editingId) {
        const response = await api.put(`/products/${editingId}`, payload);
        const updated = response.data?.data?.product;
        setProducts((current) =>
          current.map((product) =>
            product.id === editingId ? updated : product,
          ),
        );
        setMessage("Product updated.");
      } else {
        const response = await api.post("/products", payload);
        const created = response.data?.data?.product;
        setProducts((current) => [created, ...current]);
        setMessage("Product created.");
      }
      resetDraft();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to save this product.",
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleProduct = async (product) => {
    setBusyProductId(product.id);
    setError("");
    setMessage("");

    try {
      const response = await api.put(`/products/${product.id}`, {
        isActive: !product.isActive,
      });
      const updated = response.data?.data?.product;
      setProducts((current) =>
        current.map((item) => (item.id === product.id ? updated : item)),
      );
      setMessage(
        updated.isActive ? "Product published." : "Product deactivated.",
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to change product status.",
      );
    } finally {
      setBusyProductId(null);
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
            Product catalog
          </h1>
        </div>
        <Link
          to="/admin/orders"
          className="rounded-md border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Manage orders
        </Link>
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
          {editingId ? "Edit product" : "Add product"}
        </h2>
        {categories.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">
            Create a category before adding products.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ["name", "Product name", "text"],
                ["sku", "SKU", "text"],
                ["brand", "Brand", "text"],
                ["price", "Price", "number"],
                ["discountPrice", "Sale price", "number"],
                ["stock", "Stock", "number"],
              ].map(([name, label, type]) => (
                <label
                  key={name}
                  className="grid gap-1.5 text-sm font-medium text-slate-700"
                >
                  {label}
                  <input
                    name={name}
                    type={type}
                    value={draft[name]}
                    onChange={updateDraft}
                    min={type === "number" ? "0" : undefined}
                    step={
                      name === "price" || name === "discountPrice"
                        ? "0.01"
                        : "1"
                    }
                    required={name !== "discountPrice"}
                    className="rounded-md border border-slate-300 px-3 py-2.5 outline-none focus:border-orange-500"
                  />
                </label>
              ))}
              <label className="grid gap-1.5 text-sm font-medium text-slate-700">
                Category
                <select
                  name="categoryId"
                  value={draft.categoryId}
                  onChange={updateDraft}
                  required
                  className="rounded-md border border-slate-300 bg-white px-3 py-2.5"
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-2 self-end pb-3 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={draft.isActive}
                  onChange={updateDraft}
                />
                Published in storefront
              </label>
              <label className="grid gap-1.5 text-sm font-medium text-slate-700 sm:col-span-2 lg:col-span-3">
                Description
                <textarea
                  name="description"
                  value={draft.description}
                  onChange={updateDraft}
                  rows={3}
                  minLength={20}
                  required
                  className="rounded-md border border-slate-300 px-3 py-2.5 outline-none focus:border-orange-500"
                />
              </label>
              <label className="grid gap-1.5 text-sm font-medium text-slate-700 sm:col-span-2 lg:col-span-3">
                Image URLs
                <textarea
                  name="images"
                  value={draft.images}
                  onChange={updateDraft}
                  rows={3}
                  placeholder="https://example.com/product-image.jpg"
                  className="rounded-md border border-slate-300 px-3 py-2.5 outline-none focus:border-orange-500"
                />
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
                    : "Create product"}
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
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-slate-900">Products</h2>
          <span className="text-sm text-slate-500">
            {products.length} total
          </span>
        </div>
        <div className="overflow-x-auto border-y border-slate-200">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-3 py-3 font-medium">Product</th>
                <th className="px-3 py-3 font-medium">Category</th>
                <th className="px-3 py-3 font-medium">Price</th>
                <th className="px-3 py-3 font-medium">Stock</th>
                <th className="px-3 py-3 font-medium">Visibility</th>
                <th className="px-3 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-3 py-10 text-center text-slate-500"
                  >
                    Loading products...
                  </td>
                </tr>
              ) : products.length ? (
                products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-3 py-3">
                      <p className="font-semibold text-slate-900">
                        {product.name}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {product.sku} · {product.brand}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-slate-600">
                      {product.category?.name}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-slate-700">
                      {product.discountPrice ? (
                        <>
                          <span className="font-semibold">
                            {currency.format(Number(product.discountPrice))}
                          </span>
                          <span className="ml-2 text-xs text-slate-500 line-through">
                            {currency.format(Number(product.price))}
                          </span>
                        </>
                      ) : (
                        currency.format(Number(product.price))
                      )}
                    </td>
                    <td className="px-3 py-3 text-slate-700">
                      {product.stock}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={
                          product.isActive
                            ? "text-emerald-700"
                            : "text-slate-500"
                        }
                      >
                        {product.isActive ? "Published" : "Hidden"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => editProduct(product)}
                        className="mr-3 font-medium text-orange-700 hover:text-orange-900"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleProduct(product)}
                        disabled={busyProductId === product.id}
                        className="font-medium text-slate-700 hover:text-slate-900 disabled:opacity-50"
                      >
                        {busyProductId === product.id
                          ? "Saving..."
                          : product.isActive
                            ? "Deactivate"
                            : "Publish"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-3 py-10 text-center text-slate-500"
                  >
                    No products found.
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
