import { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleJoin = (event) => {
    event.preventDefault();
    setMessage(`✨ Thanks! Updates will be sent to ${email}.`);
    setEmail("");
  };

  return (
    <footer className="relative mt-20 border-t border-surface-800 bg-gradient-to-b from-surface-950 to-surface-900 text-surface-300">
      <div className="absolute inset-0 bg-gradient-to-b from-brand-500/5 via-transparent to-transparent" />
      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-4">
          <div>
            <h3 className="text-3xl font-black text-transparent gradient-text">Shop<span className="text-brand-400">Sphere</span></h3>
            <p className="mt-4 max-w-xs text-sm leading-7 text-surface-400">
              Premium essentials for everyday living and modern shopping.
            </p>
            <div className="mt-6 flex gap-4">
              {["📱", "💻", "🛍️"].map((icon, idx) => (
                <div 
                  key={idx}
                  className="rounded-full border border-surface-700 bg-surface-800/60 p-3 text-lg backdrop-blur-sm transition-all hover:border-brand-500/50 hover:bg-brand-500/10 hover:text-brand-300"
                >
                  {icon}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-bold text-surface-100">Customer Service</h4>
            <ul className="mt-4 space-y-3 text-sm text-surface-400">
              {["Help Center", "Shipping", "Returns", "Contact Us"].map((item) => (
                <li key={item} className="transition-all hover:text-brand-300">
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-surface-100">Company</h4>
            <ul className="mt-4 space-y-3 text-sm text-surface-400">
              {["About", "Careers", "Blog", "Press"].map((item) => (
                <li key={item} className="transition-all hover:text-brand-300">
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-surface-100">🎁 Get member-only deals</h4>
            <form onSubmit={handleJoin} className="mt-4">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  placeholder="Enter your email"
                  className="w-full rounded-xl border border-surface-700 bg-surface-800/60 px-4 py-3.5 text-sm text-surface-100 outline-none backdrop-blur-sm placeholder:text-surface-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-400"
                />
                <button 
                  type="submit" 
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-2.5 text-sm font-bold text-surface-50 shadow-card transition-all hover:from-brand-600 hover:to-brand-700"
                >
                  Join
                </button>
              </div>
            </form>
            {message && (
              <p role="status" className="mt-3 text-sm text-brand-400">
                {message}
              </p>
            )}
            <p className="mt-6 text-xs text-surface-500">
              By subscribing, you agree to our Privacy Policy and consent to receive updates.
            </p>
          </div>
        </div>
        <div className="mt-12 border-t border-surface-800 pt-8 text-center text-sm text-surface-500">
          <p className="mb-3">✨ ShopSphere — Making everyday shopping extraordinary ✨</p>
          <p>© 2026 ShopSphere. All rights reserved. | Privacy Policy | Terms of Service</p>
        </div>
      </div>
    </footer>
  );
}
