export default function ProductCard({
  product,
  onAddToCart,
  onToggleWishlist,
}) {
  const image =
    product?.images?.[0]?.url ||
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80";

  const price = Number(product?.price ?? 0);
  const discountPrice = product?.discountPrice
    ? Number(product.discountPrice)
    : null;
  const savings = discountPrice
    ? Math.max(0, Math.round(((price - discountPrice) / price) * 100))
    : 0;

  const handleAddToCart = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onAddToCart?.(product);
  };

  const handleToggleWishlist = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onToggleWishlist?.(product);
  };

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative">
        <img
          src={image}
          alt={product?.name || "Product image"}
          className="h-56 w-full object-cover transition duration-300 group-hover:scale-105"
        />
        <button
          type="button"
          onClick={handleToggleWishlist}
          className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-lg shadow-sm transition hover:scale-105"
          aria-label="Add to wishlist"
        >
          ♡
        </button>
        {savings > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-orange-500 px-2 py-1 text-xs font-semibold text-white">
            -{savings}%
          </span>
        )}
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
          <span>{product?.brand || "ShopSphere"}</span>
          <span>★★★★★ {product?.rating ?? 4.8}</span>
        </div>

        <h3 className="line-clamp-2 min-h-[48px] text-base font-semibold text-slate-900">
          {product?.name}
        </h3>

        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-slate-900">
            ${discountPrice ?? price}
          </span>
          {discountPrice && (
            <span className="text-sm text-slate-400 line-through">
              ${price}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>{product?.reviewCount ?? 120} reviews</span>
          <span>
            {product?.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </span>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          className="w-full rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
        >
          Add to cart
        </button>
      </div>
    </article>
  );
}
