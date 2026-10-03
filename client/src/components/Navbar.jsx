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
              <select
                value={department}
                onChange={(event) => setDepartment(event.target.value)}
                className="bg-transparent text-sm text-slate-700 outline-none"
              >
                <option value="">All Departments</option>
                <option value="electronics">Electronics</option>
                <option value="home-kitchen">Home & Kitchen</option>
                <option value="fashion">Fashion</option>
              </select>
            </div>
          </div>

          <form onSubmit={handleSearch} className="hidden flex-1 items-center gap-3 md:flex">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products, brands, categories"
              className="w-full rounded-full border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm outline-none ring-0 transition focus:border-orange-400 focus:bg-white"
            />
            <button type="submit" className="rounded-full bg-orange-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-orange-600">
              Search
            </button>
          </form>

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
                  Cart ({cartCount})
                </NavLink>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="hover:text-slate-900"
                >
                  Log out
                </button>
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
                  Cart ({cartCount})
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
