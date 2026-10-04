import { useState } from "react";

export default function ProductCard({
  product,
  onAddToCart,
  onToggleWishlist,
}) {
  const [quantity, setQuantity] = useState(1);
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
  const stock = Math.max(0, Number(product?.stock ?? 0));

  const handleAddToCart = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onAddToCart?.(product, quantity);
  };

  const changeQuantity = (event, amount) => {
    event.preventDefault();
    event.stopPropagation();
    setQuantity((current) => Math.min(stock, Math.max(1, current + amount)));
  };

  const handleToggleWishlist = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onToggleWishlist?.(product);
  };

  return (
    <article className="group overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-2 hover:shadow-[0_20px_45px_rgba(15,23,42,0.15)]">
      <div className="relative overflow-hidden bg-slate-100">
        <img
          src={image}
          alt={product?.name || "Product image"}
          className="h-60 w-full object-cover transition duration-500 group-hover:scale-110"
        />
        <button
          type="button"
          onClick={handleToggleWishlist}
          className="absolute right-3 top-3 rounded-full bg-white/95 p-2 text-lg shadow-md transition hover:scale-110 hover:text-rose-500"
          aria-label="Add to wishlist"
        >
          ♡
        </button>
        {savings > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-slate-950 px-3 py-1.5 text-xs font-bold text-white shadow-md">
            Save {savings}%
          </span>
        )}
      </div>

      <div className="space-y-3 p-5">
        <div className="flex items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
          <span>{product?.brand || "ShopSphere"}</span>
          <span className="normal-case tracking-normal text-amber-500">★ {product?.rating ?? 4.8}</span>
        </div>

        <h3 className="line-clamp-2 min-h-[48px] text-base font-bold leading-6 text-slate-900">
          {product?.name}
        </h3>

        <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-slate-950">
            ${discountPrice ?? price}
          </span>
          {discountPrice && (
            <span className="text-sm text-slate-400 line-through">
              ${price}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-sm text-slate-600">
          <span>Quantity</span>
          <div className="inline-flex h-9 items-center overflow-hidden rounded-md border border-slate-300">
            <button
              type="button"
              onClick={(event) => changeQuantity(event, -1)}
              disabled={quantity <= 1 || stock === 0}
              aria-label={`Decrease ${product?.name || "product"} quantity`}
              className="h-full w-9 text-base font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300"
            >
              -
            </button>
            <output
              aria-label="Selected quantity"
              className="min-w-9 text-center font-medium text-slate-900"
            >
              {quantity}
            </output>
            <button
              type="button"
              onClick={(event) => changeQuantity(event, 1)}
              disabled={quantity >= stock || stock === 0}
              aria-label={`Increase ${product?.name || "product"} quantity`}
              className="h-full w-9 text-base font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300"
            >
              +
            </button>
          </div>
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
          disabled={stock === 0}
          className="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-slate-200 transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {stock === 0 ? "Out of stock" : "Add to cart"}
        </button>
      </div>
    </article>
  );
}
