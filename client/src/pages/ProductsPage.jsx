import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import api from "../services/api";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [loading, setLoading] = useState(true);

  const handleAddToCart = async (product, quantity = 1) => {
    try {
      if (!localStorage.getItem("shopsphere_token")) {
        window.location.href = "/login";
        return;
      }

      await api.post("/cart/items", { productId: product.id, quantity });
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
        const [productsResponse, categoriesResponse] = await Promise.all([
          api.get("/products"),
          api.get("/categories"),
        ]);

        setProducts(productsResponse.data?.data?.products || []);
        setCategories(categoriesResponse.data?.data?.categories || []);
      } catch (error) {
        console.error("Failed to load products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = search.trim().toLowerCase();
    const items = products.filter((product) => {
      const matchesCategory =
        selectedCategory === "all" ||
        product.category?.slug === selectedCategory ||
        product.categoryId === selectedCategory;

      const matchesSearch =
        !normalizedQuery ||
        [product.name, product.brand, product.description]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesCategory && matchesSearch;
    });

    switch (sortBy) {
      case "price_asc":
        return [...items].sort((a, b) => Number(a.price) - Number(b.price));
      case "price_desc":
        return [...items].sort((a, b) => Number(b.price) - Number(a.price));
      case "rating":
        return [...items].sort((a, b) => Number(b.rating) - Number(a.rating));
      default:
        return items;
    }
  }, [products, search, selectedCategory, sortBy]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm text-slate-500">Browse products</p>
            <h1 className="text-3xl font-bold tracking-tight">All products</h1>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products..."
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-orange-400"
            />
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-orange-400"
            >
              <option value="featured">Featured</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-900">Filters</h3>
          <div className="mt-4 space-y-5 text-sm text-slate-700">
            <div>
              <p className="mb-2 font-medium">Category</p>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === "all"}
                    onChange={() => setSelectedCategory("all")}
                  />
                  All
                </label>
                {categories.map((category) => (
                  <label key={category.id} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === category.slug}
                      onChange={() => setSelectedCategory(category.slug)}
                    />
                    {category.name}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="h-80 animate-pulse rounded-2xl bg-slate-200"
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.length ? (
              filteredProducts.map((product) => (
                <Link key={product.id} to={`/products/${product.id}`}>
                  <ProductCard
                    product={product}
                    onAddToCart={handleAddToCart}
                    onToggleWishlist={handleToggleWishlist}
                  />
                </Link>
              ))
            ) : (
              <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
                No products match your current filters.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
