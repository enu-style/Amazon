import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import api from "../services/api";

const fallbackCategories = [
  { name: "Electronics", slug: "electronics", icon: "📱" },
  { name: "Home & Kitchen", slug: "home-kitchen", icon: "🏠" },
  { name: "Fashion", slug: "fashion", icon: "👗" },
  { name: "Health", slug: "health", icon: "💊" },
  { name: "Grocery", slug: "grocery", icon: "🛒" },
];

export default function HomePage() {
  const [categories, setCategories] = useState(fallbackCategories);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleAddToCart = async (product, quantity = 1) => {
    try {
      if (!localStorage.getItem("shopsphere_token")) {
        window.location.href = "/login";
        return;
      }
      await api.post("/cart/items", { productId: product.id, quantity });
      window.location.assign("/cart");
    } catch (error) {
      console.error("Failed to add product to cart:", error);
    }
  };

  const handleToggleWishlist = async (product) => {
    try {
      if (!localStorage.getItem("shopsphere_token")) {
        window.location.href = "/login";
        return;
      }
      await api.post("/wishlist", { productId: product.id });
    } catch (error) {
      console.error("Failed to update wishlist:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesResponse, productsResponse] = await Promise.all([
          api.get("/categories"),
          api.get("/products"),
        ]);

        const categoriesData = categoriesResponse.data?.data?.categories || [];
        const productsData = productsResponse.data?.data?.products || [];

        setCategories(categoriesData.length ? categoriesData : fallbackCategories);
        setProducts(productsData);
      } catch (error) {
        console.error("Failed to load storefront data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const featuredProducts = products.slice(0, 4);

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-surface-800 via-surface-900 to-surface-950 shadow-2xl shadow-black/30">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 via-brand-600/5 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-950/80 via-surface-900/30 to-transparent" />
        <div className="relative grid min-h-[480px] items-center px-7 py-16 sm:px-12 lg:grid-cols-[1.1fr_0.9fr] lg:px-20">
          <div className="animate-fade-in">
            <span className="inline-flex rounded-full border border-brand-400/40 bg-brand-500/10 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-brand-300">
              ✨ The edit of the week
            </span>
            <h1 className="mt-7 max-w-2xl text-4xl font-black leading-[1.1] tracking-tight text-surface-50 sm:text-5xl lg:text-6xl">
              Make every day feel a little more <span className="gradient-text">special.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-surface-300 sm:text-lg">
              Thoughtful finds for home, work, and everything in between—picked to make life easier and better looking.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/products"
                className="rounded-full bg-gradient-to-r from-brand-500 to-brand-600 px-7 py-4 text-sm font-bold text-surface-50 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:from-brand-600 hover:to-brand-700 hover:shadow-hover active:scale-95"
              >
                🛍️ Shop new arrivals
              </Link>
              <Link
                to="/products?sort=price_asc"
                className="rounded-full border border-surface-600 bg-surface-800/60 px-7 py-4 text-sm font-bold text-surface-200 backdrop-blur transition-all hover:border-brand-500/50 hover:bg-brand-500/10 hover:text-brand-300"
              >
                🔥 Browse all deals
              </Link>
            </div>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:mt-0">
            <div className="glass animate-slide-up rounded-2xl border border-surface-700 p-6">
              <p className="text-4xl font-black text-brand-400">50%</p>
              <p className="mt-2 text-sm font-semibold text-surface-300">off selected favorites</p>
            </div>
            <div className="glass animate-slide-up rounded-2xl border border-surface-700 p-6 delay-100">
              <p className="text-4xl font-black text-brand-400">24h</p>
              <p className="mt-2 text-sm font-semibold text-surface-300">fast order processing</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature strips */}
      <section className="grid gap-5 sm:grid-cols-3">
        {[
          ["✨", "Curated finds", "Products chosen for everyday usefulness."],
          ["⚡", "Quick dispatch", "Clear order updates from checkout to delivery."],
          ["💝", "Easy returns", "Shop with confidence and simple support."],
        ].map(([icon, title, text], index) => (
          <div 
            key={title} 
            className="glass animate-fade-in rounded-2xl border border-surface-800 p-6 shadow-card transition-all hover:-translate-y-1 hover:border-brand-500/30 hover:shadow-hover"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <span className="text-2xl text-brand-400">{icon}</span>
            <h2 className="mt-4 font-bold text-surface-100">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-surface-400">{text}</p>
          </div>
        ))}
      </section>

      {/* Categories */}
      <section className="animate-fade-in">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-400">Shop by mood</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-surface-50">
              Find your next <span className="gradient-text">favorite</span>
            </h2>
          </div>
          <Link 
            to="/products" 
            className="rounded-lg border border-surface-700 bg-surface-800/60 px-4 py-2.5 text-sm font-medium text-surface-300 transition-all hover:border-brand-500/50 hover:bg-brand-500/10 hover:text-brand-300"
          >
            View all →
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {categories.map((category, index) => (
            <div
              key={category.slug || `category-${index}`}
              className="group glass animate-slide-up rounded-2xl border border-surface-800 p-5 shadow-card transition-all duration-300 hover:-translate-y-2 hover:border-brand-500/40 hover:shadow-hover"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="mb-5 inline-flex rounded-2xl bg-gradient-to-br from-brand-500/20 to-brand-600/10 p-3.5 text-4xl transition-transform duration-300 group-hover:scale-110">
                {category.icon || "🛍️"}
              </div>
              <h3 className="font-bold text-surface-100">{category.name}</h3>
              <p className="mt-2 text-xs font-semibold text-brand-400">Shop collection →</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="animate-fade-in">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-400">Trending now</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-surface-50">
              Customer <span className="gradient-text">favorites</span>
            </h2>
          </div>
          <Link 
            to="/products" 
            className="rounded-lg border border-surface-700 bg-surface-800/60 px-4 py-2.5 text-sm font-medium text-surface-300 transition-all hover:border-brand-500/50 hover:bg-brand-500/10 hover:text-brand-300"
          >
            Browse all →
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="h-80 animate-pulse rounded-2xl bg-gradient-to-br from-surface-800 to-surface-900"
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <Link key={product.id} to={`/products/${product.id}`}>
                <ProductCard
                  product={product}
                  onAddToCart={handleAddToCart}
                  onToggleWishlist={handleToggleWishlist}
                />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
