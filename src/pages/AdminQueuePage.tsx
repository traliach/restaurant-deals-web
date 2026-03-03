import { useEffect, useState, useCallback } from "react";
import { apiGet } from "../lib/api";
import { AdminDealDrawer, type AdminDeal } from "../components/AdminDealDrawer";

type SortKey = "title" | "restaurantName" | "status" | "createdAt";
type SortDir = "asc" | "desc";

export function AdminQueuePage() {
  const [deals, setDeals] = useState<AdminDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<AdminDeal | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("SUBMITTED");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const loadDeals = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGet<AdminDeal[]>("/api/admin/deals");
      setDeals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load deals");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDeals(); }, [loadDeals]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <span className="text-slate-300 ml-1">↕</span>;
    return <span className="ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>;
  }

  const filtered = deals.filter((d) => statusFilter === "ALL" || d.status === statusFilter);
  const sorted = [...filtered].sort((a, b) => {
    const av = sortKey === "createdAt" ? (a.createdAt ?? "") : (a[sortKey] ?? "");
    const bv = sortKey === "createdAt" ? (b.createdAt ?? "") : (b[sortKey] ?? "");
    const cmp = String(av).localeCompare(String(bv));
    return sortDir === "asc" ? cmp : -cmp;
  });

  function handleAction(id: string, newStatus: string) {
    setDeals((prev) => prev.map((d) => d._id === id ? { ...d, status: newStatus } : d));
    setSelected((prev) => prev?._id === id ? { ...prev, status: newStatus } : prev);
  }

  const statusColors: Record<string, string> = {
    PUBLISHED: "bg-emerald-100 text-emerald-700",
    SUBMITTED: "bg-amber-100 text-amber-700",
    REJECTED: "bg-red-100 text-red-700",
    DRAFT: "bg-slate-100 text-slate-600",
  };

  if (loading) return <p className="text-slate-600">Loading deals...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Deal Management</h2>
          <p className="text-sm text-slate-500 mt-0.5">{sorted.length} deals shown</p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded border px-3 py-1.5 text-sm"
        >
          <option value="ALL">All statuses</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b bg-slate-50 text-xs text-slate-500">
            <tr>
              <th
                className="px-4 py-3 text-left font-semibold cursor-pointer hover:text-slate-700 select-none"
                onClick={() => toggleSort("title")}
              >
                Title <SortIcon col="title" />
              </th>
              <th
                className="px-4 py-3 text-left font-semibold cursor-pointer hover:text-slate-700 select-none"
                onClick={() => toggleSort("restaurantName")}
              >
                Restaurant <SortIcon col="restaurantName" />
              </th>
              <th className="px-4 py-3 text-left font-semibold">Cuisine</th>
              <th
                className="px-4 py-3 text-left font-semibold cursor-pointer hover:text-slate-700 select-none"
                onClick={() => toggleSort("status")}
              >
                Status <SortIcon col="status" />
              </th>
              <th
                className="px-4 py-3 text-left font-semibold cursor-pointer hover:text-slate-700 select-none"
                onClick={() => toggleSort("createdAt")}
              >
                Created <SortIcon col="createdAt" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  No deals match the current filter.
                </td>
              </tr>
            ) : sorted.map((deal) => (
              <tr
                key={deal._id}
                onClick={() => setSelected(deal)}
                className={`cursor-pointer transition-colors hover:bg-indigo-50 ${selected?._id === deal._id ? "bg-indigo-50" : ""}`}
              >
                <td className="px-4 py-3 font-medium text-slate-900">{deal.title}</td>
                <td className="px-4 py-3 text-slate-600">{deal.restaurantName}</td>
                <td className="px-4 py-3 text-slate-500">
                  {deal.cuisineType ? (
                    <span className="rounded-full bg-violet-50 px-2 py-0.5 text-xs text-violet-700">
                      {deal.cuisineType}
                    </span>
                  ) : "—"}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[deal.status] ?? "bg-slate-100 text-slate-600"}`}>
                    {deal.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-400 text-xs">
                  {deal.createdAt ? new Date(deal.createdAt).toLocaleDateString() : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdminDealDrawer deal={selected} onClose={() => setSelected(null)} onAction={handleAction} />
    </div>
  );
}
