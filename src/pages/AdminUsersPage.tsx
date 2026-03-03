import { useEffect, useState } from "react";
import { apiDelete, apiGet } from "../lib/api";

type User = {
  _id: string;
  email: string;
  role: "customer" | "owner" | "admin";
  restaurantId?: string;
  createdAt?: string;
};

type SortKey = "email" | "role" | "createdAt";
type SortDir = "asc" | "desc";

export function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    apiGet<User[]>("/api/admin/users")
      .then(setUsers)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load users"))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(user: User) {
    if (!window.confirm(`Delete ${user.email}? This cannot be undone.`)) return;
    setDeletingId(user._id);
    try {
      await apiDelete(`/api/admin/users/${user._id}`);
      setUsers((prev) => prev.filter((u) => u._id !== user._id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <span className="text-slate-300 ml-1">↕</span>;
    return <span className="ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>;
  }

  const filtered = users
    .filter((u) => (!roleFilter || u.role === roleFilter))
    .filter((u) => !search || u.email.toLowerCase().includes(search.toLowerCase()));

  const sorted = [...filtered].sort((a, b) => {
    const av = sortKey === "createdAt" ? (a.createdAt ?? "") : (a[sortKey] ?? "");
    const bv = sortKey === "createdAt" ? (b.createdAt ?? "") : (b[sortKey] ?? "");
    const cmp = String(av).localeCompare(String(bv));
    return sortDir === "asc" ? cmp : -cmp;
  });

  const roleColors: Record<string, string> = {
    admin: "bg-red-100 text-red-700",
    owner: "bg-violet-100 text-violet-700",
    customer: "bg-blue-100 text-blue-700",
  };

  if (loading) return <p className="text-slate-600">Loading users...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">User Management</h2>
          <p className="text-sm text-slate-500 mt-0.5">{sorted.length} users shown</p>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search email..."
            className="rounded border px-3 py-1.5 text-sm w-48"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded border px-3 py-1.5 text-sm"
          >
            <option value="">All roles</option>
            <option value="customer">Customer</option>
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b bg-slate-50 text-xs text-slate-500">
            <tr>
              <th
                className="px-4 py-3 text-left font-semibold cursor-pointer hover:text-slate-700 select-none"
                onClick={() => toggleSort("email")}
              >
                Email <SortIcon col="email" />
              </th>
              <th
                className="px-4 py-3 text-left font-semibold cursor-pointer hover:text-slate-700 select-none"
                onClick={() => toggleSort("role")}
              >
                Role <SortIcon col="role" />
              </th>
              <th className="px-4 py-3 text-left font-semibold">Restaurant ID</th>
              <th
                className="px-4 py-3 text-left font-semibold cursor-pointer hover:text-slate-700 select-none"
                onClick={() => toggleSort("createdAt")}
              >
                Joined <SortIcon col="createdAt" />
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  No users match the current filter.
                </td>
              </tr>
            ) : sorted.map((user) => (
              <tr key={user._id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{user.email}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${roleColors[user.role] ?? ""}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-400 text-xs font-mono">{user.restaurantId ?? "—"}</td>
                <td className="px-4 py-3 text-slate-400 text-xs">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  {user.role !== "admin" && (
                    <button
                      onClick={() => handleDelete(user)}
                      disabled={deletingId === user._id}
                      className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-40"
                    >
                      {deletingId === user._id ? "Deleting…" : "Delete"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
