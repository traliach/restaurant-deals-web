import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { NotificationsBell } from "./NotificationsBell";

const NAV_ITEMS = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/queue", label: "Deal Queue" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/bot", label: "Bot Audit" },
];

export function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Sidebar */}
      <aside className="flex w-56 shrink-0 flex-col bg-slate-900 text-slate-100">
        <div className="px-5 py-5 text-lg font-bold tracking-tight text-white border-b border-slate-700">
          Admin Panel
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `block rounded px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "text-slate-300 hover:bg-slate-700 hover:text-white"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-700 px-4 py-4 space-y-2">
          <NavLink
            to="/deals"
            className="block text-xs text-slate-400 hover:text-slate-200"
          >
            ← Back to site
          </NavLink>
          <button
            onClick={handleLogout}
            className="w-full rounded bg-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-600"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col">
        {/* Admin topbar */}
        <header className="flex items-center justify-between border-b bg-white px-6 py-3">
          <h1 className="text-sm font-semibold text-slate-700">Restaurant Deals — Admin</h1>
          <NotificationsBell />
        </header>

        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
