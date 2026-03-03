import { useEffect, useState } from "react";
import { apiGet } from "../lib/api";

type TopOwner = {
  email: string;
  restaurantId: string;
  totalDeals: number;
  published: number;
};

type Stats = {
  totalUsers: number;
  owners: number;
  customers: number;
  admins: number;
  totalRestaurants: number;
  dealCounts: {
    DRAFT: number;
    SUBMITTED: number;
    PUBLISHED: number;
    REJECTED: number;
  };
  topOwners: TopOwner[];
};

type MetricCardProps = {
  label: string;
  value: number;
  color: string;
  sub?: string;
};

function MetricCard({ label, value, color, sub }: MetricCardProps) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${color}`}>{value.toLocaleString()}</p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

export function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiGet<Stats>("/api/admin/stats")
      .then(setStats)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load stats"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-slate-600">Loading dashboard...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;
  if (!stats) return null;

  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-800">Dashboard</h2>
      <p className="mt-1 text-sm text-slate-500">Overview of your platform metrics.</p>

      <section className="mt-6">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Users</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <MetricCard label="Total Users" value={stats.totalUsers} color="text-indigo-700" />
          <MetricCard label="Customers" value={stats.customers} color="text-blue-600" />
          <MetricCard label="Owners" value={stats.owners} color="text-violet-600" />
          <MetricCard label="Admins" value={stats.admins} color="text-slate-700" />
        </div>
      </section>

      <section className="mt-8">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Platform</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <MetricCard label="Restaurants" value={stats.totalRestaurants} color="text-amber-600" />
          <MetricCard
            label="Published Deals"
            value={stats.dealCounts.PUBLISHED}
            color="text-emerald-600"
          />
          <MetricCard
            label="Pending Review"
            value={stats.dealCounts.SUBMITTED}
            color="text-orange-600"
            sub="Awaiting admin approval"
          />
        </div>
      </section>

      {stats.topOwners.length > 0 && (
        <section className="mt-8">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Most Active Owners</h3>
          <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="border-b bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Owner Email</th>
                  <th className="px-4 py-3 text-left font-semibold">Restaurant ID</th>
                  <th className="px-4 py-3 text-right font-semibold">Total Deals</th>
                  <th className="px-4 py-3 text-right font-semibold">Published</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {stats.topOwners.map((o, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{o.email ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-500">{o.restaurantId ?? "—"}</td>
                    <td className="px-4 py-3 text-right font-bold text-indigo-700">{o.totalDeals}</td>
                    <td className="px-4 py-3 text-right font-semibold text-emerald-600">{o.published}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="mt-8">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Deals by Status</h3>
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Count</th>
                <th className="px-4 py-3 text-right font-semibold">Share</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(["DRAFT", "SUBMITTED", "PUBLISHED", "REJECTED"] as const).map((status) => {
                const count = stats.dealCounts[status] ?? 0;
                const total = Object.values(stats.dealCounts).reduce((a, b) => a + b, 0);
                const pct = total ? Math.round((count / total) * 100) : 0;
                const color =
                  status === "PUBLISHED" ? "text-emerald-600" :
                  status === "SUBMITTED" ? "text-orange-600" :
                  status === "REJECTED" ? "text-red-600" : "text-slate-500";
                return (
                  <tr key={status}>
                    <td className={`px-4 py-3 font-medium ${color}`}>{status}</td>
                    <td className="px-4 py-3 text-right font-bold">{count}</td>
                    <td className="px-4 py-3 text-right text-slate-500">{pct}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
