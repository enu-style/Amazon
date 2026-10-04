import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import api from "../services/api";
import { logout, setCredentials } from "../store/authSlice";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Products", to: "/products" },
  { label: "Deals", to: "/products?sort=price_asc" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!token) {
      setCartCount(0);
      return;
    }

    const loadNavigationData = async () => {
      try {
        const [profileResponse, cartResponse] = await Promise.all([
          api.get("/auth/me"),
          api.get("/cart"),
        ]);
        const currentUser = profileResponse.data?.data?.user;
        const cart = cartResponse.data?.data?.cart;

        if (currentUser) {
          dispatch(setCredentials({ token, user: currentUser }));
        }
        setCartCount(cart?.itemCount || 0);
      } catch (error) {
        console.error("Failed to load navigation data:", error);
      }
    };

    loadNavigationData();
  }, [dispatch, token]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (department) params.set("category", department);
    navigate(`/products${params.size ? `?${params.toString()}` : ""}`);
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? "border-b border-surface-800 bg-surface-900/95 shadow-hover backdrop-blur-md" 
        : "border-b border-surface-800/30 bg-surface-900/90 backdrop-blur-sm"
    }`}>
      <div className="bg-gradient-to-r from-brand-700/90 to-brand-600/80 px-4 py-2.5 text-center text-xs font-semibold text-surface-50">
        ✨ Free delivery on orders over $50 • New customer savings available ✨
      </div>
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <NavLink
              to="/"
              className="text-2xl font-black tracking-tight text-transparent gradient-text"
            >
              Shop<span className="text-brand-400">Sphere</span>
            </NavLink>
            <div className="hidden items-center gap-2 rounded-full border border-surface-700 bg-surface-800/60 px-3 py-2 backdrop-blur-sm md:flex">
              <select
                value={department}
                onChange={(event) => setDepartment(event.target.value)}
                className="bg-transparent text-sm text-surface-300 outline-none"
              >
                <option value="" className="bg-surface-800">All Departments</option>
                <option value="electronics" className="bg-surface-800">Electronics</option>
                <option value="home-kitchen" className="bg-surface-800">Home & Kitchen</option>
                <option value="fashion" className="bg-surface-800">Fashion</option>
              </select>
            </div>
          </div>

          <form onSubmit={handleSearch} className="hidden flex-1 items-center gap-3 md:flex">
            <div className="relative flex-1">
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products, brands, categories..."
                className="w-full rounded-full border border-surface-700 bg-surface-800/60 px-5 py-3 text-sm text-surface-100 placeholder-surface-400 outline-none ring-0 transition-all duration-200 focus:border-brand-500 focus:bg-surface-800 focus:shadow-[0_0_0_4px_rgba(251,146,60,0.2)] focus:ring-1 focus:ring-brand-400"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                🔍
              </div>
            </div>
            <button 
              type="submit" 
              className="rounded-full bg-gradient-to-r from-brand-500 to-brand-600 px-5 py-3 text-sm font-bold text-surface-50 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:from-brand-600 hover:to-brand-700 hover:shadow-hover active:scale-95"
            >
              Search
            </button>
          </form>

          <nav className="hidden items-center gap-4 text-sm text-surface-300 lg:flex">
            {token ? (
              <>
                <span className="font-medium text-brand-300">
                  👋 Hi, {user?.firstName || "there"}
                </span>
                <NavLink 
                  to="/account" 
                  className="rounded-lg px-3 py-2 transition-all hover:bg-surface-800 hover:text-surface-100"
                >
                  Account
                </NavLink>
                {user?.role === "ADMIN" && (
                  <NavLink 
                    to="/admin" 
                    className="rounded-lg px-3 py-2 transition-all hover:bg-surface-800 hover:text-surface-100"
                  >
                    Admin
                  </NavLink>
                )}
                <NavLink 
                  to="/orders" 
                  className="rounded-lg px-3 py-2 transition-all hover:bg-surface-800 hover:text-surface-100"
                >
                  Orders
                </NavLink>
                <NavLink 
                  to="/wishlist" 
                  className="rounded-lg px-3 py-2 transition-all hover:bg-surface-800 hover:text-surface-100"
                >
                  Wishlist
                </NavLink>
                <NavLink 
                  to="/cart" 
                  className="group relative rounded-full bg-gradient-to-r from-surface-800 to-surface-900 px-4 py-2.5 font-semibold text-surface-100 transition-all hover:from-brand-700 hover:to-brand-800 hover:shadow-card"
                >
                  <span className="flex items-center gap-2">
                    🛒 Cart
                    {cartCount > 0 && (
                      <span className="rounded-full bg-brand-500 px-2 py-0.5 text-xs font-bold text-surface-50">
                        {cartCount}
                      </span>
                    )}
                  </span>
                </NavLink>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg px-3 py-2 text-surface-400 transition-all hover:bg-surface-800 hover:text-surface-100"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <NavLink 
                  to="/login" 
                  className="rounded-lg px-3 py-2 transition-all hover:bg-surface-800 hover:text-surface-100"
                >
                  Login
                </NavLink>
                <NavLink 
                  to="/register" 
                  className="rounded-lg px-3 py-2 transition-all hover:bg-surface-800 hover:text-surface-100"
                >
                  Register
                </NavLink>
                <NavLink 
                  to="/cart" 
                  className="group relative rounded-full bg-gradient-to-r from-surface-800 to-surface-900 px-4 py-2.5 font-semibold text-surface-100 transition-all hover:from-brand-700 hover:to-brand-800 hover:shadow-card"
                >
                  <span className="flex items-center gap-2">
                    🛒 Cart
                    {cartCount > 0 && (
                      <span className="rounded-full bg-brand-500 px-2 py-0.5 text-xs font-bold text-surface-50">
                        {cartCount}
                      </span>
                    )}
                  </span>
                </NavLink>
              </>
            )}
          </nav>

          <button className="rounded-lg border border-surface-700 bg-surface-800 p-2.5 text-sm font-medium text-surface-300 transition-all hover:bg-surface-700 lg:hidden">
            ☰
          </button>
        </div>

        <nav className="mt-4 hidden flex-wrap items-center gap-5 border-t border-surface-800/50 pt-3 text-sm font-medium text-surface-400 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 transition-all ${
                  isActive 
                    ? "bg-gradient-to-r from-brand-600/20 to-brand-700/20 text-brand-300 font-semibold shadow-inner" 
                    : "hover:bg-surface-800 hover:text-surface-200"
                }`
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
