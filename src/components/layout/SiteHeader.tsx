import { Heart, Menu, Shield, ShoppingCart, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { logout } from "../../store/authSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { NotificationsBell } from "../NotificationsBell";

const navItemClass = ({ isActive }: { isActive: boolean }) =>
  [
    "rounded-full px-3 py-2 text-sm font-medium transition",
    isActive
      ? "bg-slate-900 text-white shadow-sm"
      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
  ].join(" ");

export function SiteHeader() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const role = useAppSelector((state) => state.auth.role);
  const cartCount = useAppSelector((state) =>
    state.cart.items.reduce((sum, item) => sum + item.qty, 0)
  );
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  function handleLogout() {
    dispatch(logout());
    closeMenu();
    navigate("/login");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link
            to="/"
            onClick={closeMenu}
            className="text-lg font-bold tracking-tight text-slate-900"
          >
            <span className="text-indigo-600">Restaurant</span> Deals
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <NavLink to="/deals" className={navItemClass}>
              Deals
            </NavLink>
            <NavLink to="/favorites" className={navItemClass}>
              Favorites
            </NavLink>
            {role === "customer" ? (
              <NavLink to="/orders" className={navItemClass}>
                Orders
              </NavLink>
            ) : null}
            <NavLink to="/cart" className={navItemClass}>
              Cart
            </NavLink>
            {role === "owner" ? (
              <>
                <NavLink to="/portal" className={navItemClass}>
                  Portal
                </NavLink>
                <NavLink to="/explore" className={navItemClass}>
                  Explore
                </NavLink>
              </>
            ) : null}
            {role === "admin" ? (
              <NavLink to="/admin/dashboard" className={navItemClass}>
                Admin
              </NavLink>
            ) : null}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            className="inline-flex rounded-full p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 md:hidden"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link
            to="/favorites"
            className="hidden rounded-full p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 md:inline-flex"
            aria-label="Favorites"
          >
            <Heart className="h-5 w-5" />
          </Link>

          <Link
            to="/cart"
            className="relative hidden rounded-full p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 md:inline-flex"
            aria-label="Cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 ? (
              <span className="absolute -right-1 -top-1 rounded-full bg-indigo-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            ) : null}
          </Link>

          {role ? (
            <>
              <div className="hidden md:block">
                <NotificationsBell />
              </div>

              {role === "admin" ? (
                <Link
                  to="/admin/dashboard"
                  className="hidden rounded-full p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 md:inline-flex"
                  aria-label="Admin dashboard"
                >
                  <Shield className="h-5 w-5" />
                </Link>
              ) : null}

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link
                to="/login"
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-600"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>

      {menuOpen ? (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 sm:px-6">
            <NavLink to="/deals" className={navItemClass} onClick={closeMenu}>
              Deals
            </NavLink>
            <NavLink to="/favorites" className={navItemClass} onClick={closeMenu}>
              Favorites
            </NavLink>
            {role === "customer" ? (
              <NavLink to="/orders" className={navItemClass} onClick={closeMenu}>
                Orders
              </NavLink>
            ) : null}
            <NavLink to="/cart" className={navItemClass} onClick={closeMenu}>
              Cart{cartCount > 0 ? ` (${cartCount})` : ""}
            </NavLink>
            {role === "owner" ? (
              <>
                <NavLink to="/portal" className={navItemClass} onClick={closeMenu}>
                  Portal
                </NavLink>
                <NavLink to="/explore" className={navItemClass} onClick={closeMenu}>
                  Explore
                </NavLink>
              </>
            ) : null}
            {role === "admin" ? (
              <NavLink to="/admin/dashboard" className={navItemClass} onClick={closeMenu}>
                Admin
              </NavLink>
            ) : null}

            {!role ? (
              <div className="mt-2 flex gap-2">
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={closeMenu}
                  className="flex-1 rounded-xl bg-slate-900 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-indigo-600"
                >
                  Register
                </Link>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleLogout}
                className="mt-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
