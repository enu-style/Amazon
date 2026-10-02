const categories = [
  { name: "Electronics", icon: "📱" },
  { name: "Home & Kitchen", icon: "🏠" },
  { name: "Fashion", icon: "👗" },
  { name: "Health", icon: "💊" },
  { name: "Grocery", icon: "🛒" },
];

const deals = [
  { name: "Smart TVs", price: "$399", tag: "Up to 35% off" },
  { name: "Wireless Audio", price: "$89", tag: "New arrivals" },
  { name: "Kitchen Gear", price: "$129", tag: "Daily deals" },
];

const products = [
  {
    name: "AeroSound Pro",
    price: "$129",
    oldPrice: "$199",
    rating: 4.8,
    reviews: 320,
  },
  {
    name: "Nova Lamp",
    price: "$54",
    oldPrice: "$89",
    rating: 4.6,
    reviews: 220,
  },
  {
    name: "Urban Backpack",
    price: "$72",
    oldPrice: "$104",
    rating: 4.7,
    reviews: 160,
  },
  {
    name: "PureClean Bottle",
    price: "$28",
    oldPrice: "$42",
    rating: 4.9,
    reviews: 400,
  },
];

export default function HomePage() {
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
              <button className="rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-600">
                Shop now
              </button>
              <button className="rounded-full border border-slate-400 px-5 py-3 text-sm font-semibold text-white hover:bg-white/5">
                Explore deals
              </button>
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
          <button className="text-sm font-medium text-orange-600">
            View all
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {categories.map((category) => (
            <div
              key={category.name}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-4 text-3xl">{category.icon}</div>
              <h3 className="font-semibold text-slate-900">{category.name}</h3>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Today’s deals</h2>
          <button className="text-sm font-medium text-orange-600">
            See all deals
          </button>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {deals.map((deal) => (
            <div
              key={deal.name}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="h-40 rounded-xl bg-gradient-to-br from-slate-200 to-slate-100" />
              <div className="mt-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-slate-900">{deal.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">{deal.tag}</p>
                </div>
                <span className="rounded-full bg-orange-100 px-2 py-1 text-sm font-semibold text-orange-700">
                  {deal.price}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">
            Popular products
          </h2>
          <button className="text-sm font-medium text-orange-600">
            Browse all
          </button>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <article
              key={product.name}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="h-48 bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200" />
              <div className="p-4">
                <div className="mb-2 flex items-center justify-between text-sm text-amber-500">
                  <span>★★★★★</span>
                  <span className="text-slate-500">
                    {product.reviews} reviews
                  </span>
                </div>
                <h3 className="font-semibold text-slate-900">{product.name}</h3>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-lg font-bold text-slate-900">
                    {product.price}
                  </span>
                  <span className="text-sm text-slate-400 line-through">
                    {product.oldPrice}
                  </span>
                </div>
                <button className="mt-4 w-full rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600">
                  Add to cart
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
