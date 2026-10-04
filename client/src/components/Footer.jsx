import { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleJoin = (event) => {
    event.preventDefault();
    setMessage(`Thanks! Updates will be sent to ${email}.`);
    setEmail("");
  };

  return (
    <footer className="mt-16 bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <h3 className="text-2xl font-black text-white">Shop<span className="text-orange-400">Sphere</span></h3>
            <p className="mt-3 max-w-xs text-sm leading-6 text-slate-400">
              Premium essentials for everyday living and modern shopping.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-white">Customer Service</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              <li>Help Center</li>
              <li>Shipping</li>
              <li>Returns</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white">Company</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              <li>About</li>
              <li>Careers</li>
              <li>Blog</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white">Get member-only deals</h4>
            <form onSubmit={handleJoin} className="mt-3 flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                placeholder="Email address"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-orange-400"
              />
              <button type="submit" className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-orange-400">
                Join
              </button>
            </form>
            {message && (
              <p role="status" className="mt-2 text-xs text-emerald-400">
                {message}
              </p>
            )}
          </div>
        </div>
        <div className="mt-8 border-t border-slate-800 pt-4 text-center text-sm text-slate-500">
          © 2026 ShopSphere. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
