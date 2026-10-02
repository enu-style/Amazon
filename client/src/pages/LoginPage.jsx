export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
      <h1 className="text-3xl font-bold tracking-tight">Sign in</h1>
      <p className="mt-2 text-sm text-slate-500">Welcome back to ShopSphere</p>

      <form className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            type="email"
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-orange-400"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            type="password"
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-orange-400"
            placeholder="••••••••"
          />
        </div>
        <button className="w-full rounded-xl bg-orange-500 px-4 py-3 font-semibold text-white hover:bg-orange-600">
          Sign in
        </button>
      </form>
    </div>
  );
}
