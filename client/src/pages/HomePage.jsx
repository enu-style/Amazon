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

  const handleAddToCart = async (product) => {
    try {
      if (!localStorage.getItem("shopsphere_token")) {
        window.location.href = "/login";
        return;
      }

      await api.post("/cart/items", { productId: product.id, quantity: 1 });
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

        setCategories(
          categoriesData.length ? categoriesData : fallbackCategories,
        );
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
    <div className="space-y-10">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 text-white shadow-soft">
        <div className="grid gap-8 px-6 py-10 md:grid-cols-2 md:px-10 lg:px-12">
          <div className="flex flex-col justify-center">
            <span className="mb-3 w-fit rounded-full bg-orange-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-orange-200">
              Fresh picks
            </span>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              Upgrade your everyday essentials.
            </h1>
            <p className="mt-4 max-w-lg text-sm text-slate-200 sm:text-base">
              Discover premium gadgets, home upgrades, smart accessories, and
              everyday favorites curated for modern living.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                to="/products"
                className="rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-600"
              >
                Shop now
              </Link>
              <Link
                to="/products?sort=price_asc"
                className="rounded-full border border-slate-400 px-5 py-3 text-sm font-semibold text-white hover:bg-white/5"
              >
                Explore deals
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-300">
                Trending
              </p>
              <h3 className="mt-3 text-2xl font-bold">Smart living</h3>
              <div className="mt-8 h-40 rounded-2xl bg-gradient-to-br from-orange-400 to-yellow-300" />
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl bg-orange-500 p-5 text-white">
                <p className="text-xs uppercase tracking-[0.2em] text-orange-100">
                  Hot deal
                </p>
                <h3 className="mt-3 text-3xl font-black">50% OFF</h3>
              </div>
              <div className="rounded-2xl bg-white/10 p-5 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-300">
                  Fast shipping
                </p>
                <h3 className="mt-3 text-xl font-bold">
                  Free delivery over $50
                </h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">
            Featured categories
          </h2>
          <Link to="/products" className="text-sm font-medium text-orange-600">
            View all
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {categories.map((category, index) => (
            <div
              key={category.slug || `category-${index}`}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-4 text-3xl">{category.icon || "🛍️"}</div>
              <h3 className="font-semibold text-slate-900">{category.name}</h3>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">
            Popular products
          </h2>
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
