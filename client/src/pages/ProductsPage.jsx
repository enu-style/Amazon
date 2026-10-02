const products = [
  { name: "AeroSound Pro", price: 129, rating: 4.8 },
  { name: "Nova Lamp", price: 54, rating: 4.6 },
  { name: "Urban Backpack", price: 72, rating: 4.7 },
  { name: "PureClean Bottle", price: 28, rating: 4.9 },
  { name: "Zen Charger", price: 39, rating: 4.5 },
  { name: "Summit Speaker", price: 94, rating: 4.7 },
];

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm text-slate-500">Browse products</p>
            <h1 className="text-3xl font-bold tracking-tight">All products</h1>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <button className="rounded-full border border-slate-200 px-3 py-2">
              Filter
            </button>
            <button className="rounded-full border border-slate-200 px-3 py-2">
              Sort: Featured
            </button>
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
                  <input type="checkbox" /> Electronics
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" /> Home
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" /> Fashion
                </label>
              </div>
            </div>
            <div>
              <p className="mb-2 font-medium">Price</p>
              <input type="range" className="w-full" />
            </div>
            <div>
              <p className="mb-2 font-medium">Rating</p>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="radio" name="rating" /> 4+
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="rating" /> 3+
                </label>
              </div>
            </div>
          </div>
        </aside>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <article
              key={product.name}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="h-52 bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200" />
              <div className="p-4">
                <div className="flex items-center justify-between text-sm text-amber-500">
                  <span>★★★★★</span>
                  <span className="text-slate-500">{product.rating}</span>
                </div>
                <h3 className="mt-2 font-semibold text-slate-900">
                  {product.name}
                </h3>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xl font-bold text-slate-900">
                    ${product.price}
                  </span>
                  <button className="rounded-lg bg-orange-500 px-3 py-2 text-sm font-semibold text-white">
                    Add
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
