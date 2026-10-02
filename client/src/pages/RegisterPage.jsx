export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
      <h1 className="text-3xl font-bold tracking-tight">Create account</h1>
      <p className="mt-2 text-sm text-slate-500">Join ShopSphere today</p>

      <form className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            First name
          </label>
          <input
            type="text"
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-orange-400"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Last name
          </label>
          <input
            type="text"
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-orange-400"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            type="email"
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-orange-400"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            type="password"
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-orange-400"
          />
        </div>
        <button className="sm:col-span-2 w-full rounded-xl bg-orange-500 px-4 py-3 font-semibold text-white hover:bg-orange-600">
          Create account
        </button>
      </form>
    </div>
  );
}
