import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Products", to: "/products" },
  { label: "Deals", to: "/products?sort=price_asc" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

export default function Navbar() {
  const { user, token } = useSelector((state) => state.auth);

  return (
    <header className="border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <NavLink
              to="/"
              className="text-2xl font-black tracking-tight text-orange-500"
            >
              ShopSphere
            </NavLink>
            <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 md:flex">
              <select className="bg-transparent text-sm text-slate-700 outline-none">
                <option>All Departments</option>
                <option>Electronics</option>
                <option>Home</option>
                <option>Fashion</option>
              </select>
            </div>
          </div>

          <div className="hidden flex-1 items-center gap-3 md:flex">
            <input
              type="text"
              placeholder="Search products, brands, categories"
              className="w-full rounded-full border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm outline-none ring-0 transition focus:border-orange-400 focus:bg-white"
            />
            <button className="rounded-full bg-orange-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-orange-600">
              Search
            </button>
          </div>

          <nav className="hidden items-center gap-5 text-sm text-slate-600 lg:flex">
            {token ? (
              <>
                <span className="font-medium text-slate-700">
                  Hi, {user?.firstName || "there"}
                </span>
                <NavLink to="/account" className="hover:text-slate-900">
                  Account
                </NavLink>
                {user?.role === "ADMIN" && (
                  <NavLink to="/admin" className="hover:text-slate-900">
                    Admin
                  </NavLink>
                )}
                <NavLink to="/orders" className="hover:text-slate-900">
                  Orders
                </NavLink>
                <NavLink to="/wishlist" className="hover:text-slate-900">
                  Wishlist
                </NavLink>
                <NavLink to="/cart" className="hover:text-slate-900">
                  Cart (0)
                </NavLink>
              </>
            ) : (
              <>
                <NavLink to="/login" className="hover:text-slate-900">
                  Login
                </NavLink>
                <NavLink to="/register" className="hover:text-slate-900">
                  Register
                </NavLink>
                <NavLink to="/cart" className="hover:text-slate-900">
                  Cart (0)
                </NavLink>
              </>
            )}
          </nav>

          <button className="rounded-md border border-slate-200 p-2 text-sm font-medium text-slate-700 lg:hidden">
            Menu
          </button>
        </div>

        <nav className="mt-4 hidden flex-wrap items-center gap-4 border-t border-slate-200 pt-3 text-sm text-slate-600 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `transition ${isActive ? "font-semibold text-slate-900" : "hover:text-slate-900"}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
