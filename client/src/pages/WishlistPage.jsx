import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function WishlistPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      const response = await api.get("/wishlist");
      const payload = response.data?.data?.wishlist ||
        response.data?.wishlist || { items: [] };
      setItems(payload.items || []);
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const removeItem = async (productId) => {
    try {
      await api.delete(`/wishlist/${productId}`);
      fetchWishlist();
    } catch (error) {
      console.error("Failed to remove wishlist item:", error);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center text-slate-500">
        Loading wishlist...
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-3xl font-bold tracking-tight">Your wishlist</h1>

      {items.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <p className="text-lg font-semibold text-slate-800">
            No saved items yet
          </p>
          <Link
            to="/products"
            className="mt-4 inline-block rounded-xl bg-orange-500 px-4 py-2.5 font-semibold text-white"
          >
            Browse products
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((entry) => {
            const product = entry.product;
            const image =
              product.images?.[0]?.url ||
              "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80";

            return (
              <div
                key={entry.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <img
                  src={image}
                  alt={product.name}
                  className="h-52 w-full object-cover"
                />
                <div className="space-y-3 p-4">
                  <h2 className="font-semibold text-slate-900">
                    {product.name}
                  </h2>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-slate-900">
                      $
                      {Number(product.discountPrice || product.price).toFixed(
                        2,
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(product.id)}
                      className="text-sm font-medium text-red-500"
                    >
                      Remove
                    </button>
                  </div>
                  <Link
                    to={`/products/${product.id}`}
                    className="block rounded-xl border border-slate-200 px-3 py-2 text-center text-sm font-semibold text-slate-700"
                  >
                    View product
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
