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
    <footer className="mt-12 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">ShopSphere</h3>
            <p className="mt-3 text-sm text-slate-600">
              Premium essentials for everyday living and modern shopping.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900">Customer Service</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>Help Center</li>
              <li>Shipping</li>
              <li>Returns</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900">Company</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>About</li>
              <li>Careers</li>
              <li>Blog</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900">Newsletter</h4>
            <form onSubmit={handleJoin} className="mt-3 flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                placeholder="Email address"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none"
              />
              <button type="submit" className="rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white">
                Join
              </button>
            </form>
            {message && (
              <p role="status" className="mt-2 text-xs text-emerald-700">
                {message}
              </p>
            )}
          </div>
        </div>
        <div className="mt-8 border-t border-slate-200 pt-4 text-center text-sm text-slate-500">
          © 2026 ShopSphere. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
