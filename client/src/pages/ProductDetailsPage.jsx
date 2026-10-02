import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";

const initialReviewForm = {
  rating: 5,
  title: "",
  comment: "",
};

export default function ProductDetailsPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [reviewForm, setReviewForm] = useState(initialReviewForm);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");

  const handleAddToCart = async () => {
    try {
      if (!localStorage.getItem("shopsphere_token")) {
        window.location.href = "/login";
        return;
      }

      await api.post("/cart/items", { productId: product.id, quantity });
    } catch (err) {
      console.error("Failed to add product to cart:", err);
    }
  };

  const handleToggleWishlist = async () => {
    try {
      if (!localStorage.getItem("shopsphere_token")) {
        window.location.href = "/login";
        return;
      }

      await api.post("/wishlist", { productId: product.id });
    } catch (err) {
      console.error("Failed to update wishlist:", err);
    }
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();

    if (!localStorage.getItem("shopsphere_token")) {
      window.location.href = "/login";
      return;
    }

    setSubmittingReview(true);
    setReviewMessage("");

    try {
      const response = await api.post(`/products/${id}/reviews`, {
        rating: Number(reviewForm.rating),
        title: reviewForm.title,
        comment: reviewForm.comment,
      });

      const updatedProduct = response.data?.data?.product || product;
      setProduct(updatedProduct);
      setReviewForm(initialReviewForm);
      setReviewMessage("Review submitted successfully.");
    } catch (err) {
      setReviewMessage(
        err.response?.data?.message || "Unable to submit review.",
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/products/${id}`);
        setProduct(
          response.data?.data?.product || response.data?.product || null,
        );
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to load product details.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center text-slate-500">
        Loading product...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-600">
        {error || "Product not found."}
      </div>
    );
  }

  const mainImage =
    product.images?.[0]?.url ||
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80";

  return (
    <div className="space-y-8">
      <div className="grid gap-8 rounded-3xl bg-white p-6 shadow-sm md:grid-cols-2">
        <div className="space-y-4">
          <img
            src={mainImage}
            alt={product.name}
            className="h-[520px] w-full rounded-2xl object-cover"
          />
          <div className="grid grid-cols-3 gap-3">
            {(product.images || []).slice(0, 3).map((image, index) => (
              <img
                key={`${product.id}-${index}`}
                src={image.url}
                alt={`${product.name} view ${index + 1}`}
                className="h-28 w-full rounded-xl object-cover"
              />
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-orange-600">
              {product.brand}
            </p>
            <h1 className="mt-2 text-3xl font-black text-slate-900">
              {product.name}
            </h1>
          </div>

          <div className="flex items-center gap-3 text-sm text-slate-600">
            <span className="text-amber-500">★★★★★</span>
            <span>{product.rating ?? 4.8}</span>
            <span>({product.reviewCount ?? 0} reviews)</span>
          </div>

          <div className="flex items-end gap-3">
            <span className="text-3xl font-black text-slate-900">
              ${product.discountPrice ?? product.price}
            </span>
            {product.discountPrice && (
              <span className="text-lg text-slate-400 line-through">
                ${product.price}
              </span>
            )}
          </div>

          <p className="text-slate-600">{product.description}</p>

          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-slate-700">
              Quantity
            </label>
            <div className="flex items-center rounded-xl border border-slate-200">
              <button
                type="button"
                className="px-3 py-2 text-lg"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              >
                −
              </button>
              <span className="min-w-10 text-center text-sm font-semibold">
                {quantity}
              </span>
              <button
                type="button"
                className="px-3 py-2 text-lg"
                onClick={() =>
                  setQuantity((value) =>
                    Math.min(product.stock || 10, value + 1),
                  )
                }
              >
                +
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleAddToCart}
              className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600"
            >
              Add to cart
            </button>
            <button
              onClick={handleToggleWishlist}
              className="rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-100"
            >
              Wishlist
            </button>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            <p>
              <strong>Stock:</strong>{" "}
              {product.stock > 0 ? "In stock" : "Currently unavailable"}
            </p>
            <p>
              <strong>SKU:</strong> {product.sku}
            </p>
            <p>
              <strong>Category:</strong> {product.category?.name || "General"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">
            Customer reviews
          </h2>

          {(product.reviews || []).length === 0 ? (
            <p className="mt-4 text-slate-600">
              No reviews yet. Be the first to share your feedback.
            </p>
          ) : (
            <div className="mt-5 space-y-4">
              {(product.reviews || []).map((review) => (
                <div
                  key={review.id}
                  className="rounded-2xl border border-slate-200 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {review.user?.firstName || "Customer"}{" "}
                        {review.user?.lastName || ""}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                      {review.rating}/5
                    </span>
                  </div>
                  {review.title && (
                    <p className="mt-3 font-medium text-slate-800">
                      {review.title}
                    </p>
                  )}
                  <p className="mt-2 text-sm text-slate-600">
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">Write a review</h2>
          <form onSubmit={handleReviewSubmit} className="mt-5 space-y-4">
            <label className="block text-sm text-slate-700">
              <span className="mb-1 block font-medium">Rating</span>
              <select
                value={reviewForm.rating}
                onChange={(event) =>
                  setReviewForm((current) => ({
                    ...current,
                    rating: Number(event.target.value),
                  }))
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-orange-400"
              >
                {[5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={value}>
                    {value} stars
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm text-slate-700">
              <span className="mb-1 block font-medium">Title</span>
              <input
                value={reviewForm.title}
                onChange={(event) =>
                  setReviewForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                placeholder="What did you like?"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-orange-400"
              />
            </label>

            <label className="block text-sm text-slate-700">
              <span className="mb-1 block font-medium">Comment</span>
              <textarea
                value={reviewForm.comment}
                onChange={(event) =>
                  setReviewForm((current) => ({
                    ...current,
                    comment: event.target.value,
                  }))
                }
                rows={5}
                placeholder="Tell other shoppers about your experience"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-orange-400"
                required
              />
            </label>

            {reviewMessage && (
              <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                {reviewMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={submittingReview}
              className="w-full rounded-xl bg-orange-500 px-4 py-3 font-semibold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-orange-300"
            >
              {submittingReview ? "Submitting..." : "Submit review"}
            </button>
            <p className="text-xs text-slate-500">
              Need an account?{" "}
              <Link to="/login" className="font-semibold text-orange-600">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
