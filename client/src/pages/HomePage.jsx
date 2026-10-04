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
    <div className="space-y-14">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-2xl shadow-slate-300">
        <img
          src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1800&q=85"
          alt="Colorful shopping bags"
          className="absolute inset-0 h-full w-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/20" />
        <div className="relative grid min-h-[430px] items-center px-7 py-12 sm:px-12 lg:grid-cols-[1.1fr_0.9fr] lg:px-16">
          <div>
            <span className="inline-flex rounded-full border border-orange-300/40 bg-orange-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-orange-200">
              The edit of the week
            </span>
            <h1 className="mt-6 max-w-2xl text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Make every day feel a little more special.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-200 sm:text-lg">
              Thoughtful finds for home, work, and everything in between—picked to make life easier and better looking.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/products"
                className="rounded-full bg-orange-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-950/40 transition hover:-translate-y-0.5 hover:bg-orange-400"
              >
                Shop new arrivals
              </Link>
              <Link
                to="/products?sort=price_asc"
                className="rounded-full border border-white/40 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20"
              >
                Browse all deals
              </Link>
            </div>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:mt-0">
            <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-md">
              <p className="text-3xl font-black text-orange-300">50%</p>
              <p className="mt-1 text-sm font-semibold">off selected favorites</p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-md">
              <p className="text-3xl font-black text-orange-300">24h</p>
              <p className="mt-1 text-sm font-semibold">fast order processing</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature strips */}
      <section className="grid gap-4 sm:grid-cols-3">
        {[
          ["✦", "Curated finds", "Products chosen for everyday usefulness."],
          ["↗", "Quick dispatch", "Clear order updates from checkout to delivery."],
          ["♡", "Easy returns", "Shop with confidence and simple support."],
        ].map(([icon, title, text]) => (
          <div key={title} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <span className="text-xl text-orange-500">{icon}</span>
            <h2 className="mt-3 font-bold text-slate-950">{title}</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">{text}</p>
          </div>
        ))}
      </section>

      {/* Categories */}
      <section>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-600">Shop by mood</p>
            <h2 className="mt-1 text-3xl font-black tracking-tight text-slate-950">
              Find your next favorite
            </h2>
          </div>
          <Link to="/products" className="text-sm font-medium text-orange-600">
            View all
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {categories.map((category, index) => (
            <div
              key={category.slug || `category-${index}`}
              className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg"
            >
              <div className="mb-4 inline-flex rounded-2xl bg-orange-50 p-3 text-3xl transition group-hover:scale-110">
                {category.icon || "🛍️"}
              </div>
              <h3 className="font-bold text-slate-900">{category.name}</h3>
              <p className="mt-1 text-xs font-semibold text-orange-600">Shop collection →</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-600">Trending now</p>
            <h2 className="mt-1 text-3xl font-black tracking-tight text-slate-950">
              Customer favorites
            </h2>
          </div>
          <Link to="/products" className="text-sm font-medium text-orange-600">
            Browse all
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="h-80 animate-pulse rounded-2xl bg-slate-200"
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
