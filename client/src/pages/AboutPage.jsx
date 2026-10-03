export default function AboutPage() {
  return (
    <section className="mx-auto max-w-3xl space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.15em] text-orange-700">
          About ShopSphere
        </p>
        <h1 className="mt-2 text-3xl font-black text-slate-900">
          Everyday shopping, made simple.
        </h1>
      </header>
      <p className="leading-7 text-slate-600">
        ShopSphere brings together useful products, clear prices, and a simple
        shopping experience for everyday needs.
      </p>
      <p className="leading-7 text-slate-600">
        Browse our collection, save items to your wishlist, and manage your
        orders from one place.
      </p>
    </section>
  );
}
