import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../lib/api";

type SubmittedDeal = {
  _id: string;
  title: string;
  restaurantName: string;
  status: "SUBMITTED";
  createdAt?: string;
};

type QueueFilter = "ALL" | "SUBMITTED";

export function AdminPage() {
  const [items, setItems] = useState<SubmittedDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [queueFilter, setQueueFilter] = useState<QueueFilter>("ALL");

  useEffect(() => {
    async function loadQueue() {
      try {
        const data = await apiGet<SubmittedDeal[]>("/api/admin/deals/submitted");
        setItems(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load admin queue");
      } finally {
        setLoading(false);
      }
    }
    loadQueue();
  }, []);

  async function approveDeal(id: string) {
    try {
      await apiPost(`/api/admin/deals/${id}/approve`);
      setItems((prev) => prev.filter((d) => d._id !== id));
      setSuccess("Deal approved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Approve failed");
    }
  }

  async function rejectDeal(id: string) {
    const reason = window.prompt("Rejection reason:");
    if (!reason?.trim()) return;
    try {
      await apiPost(`/api/admin/deals/${id}/reject`, { reason: reason.trim() });
      setItems((prev) => prev.filter((d) => d._id !== id));
      setSuccess("Deal rejected.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reject failed");
    }
  }

  if (loading) return <p className="text-slate-600">Loading admin queue...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;
  if (items.length === 0) return <p className="text-slate-600">No submitted deals.</p>;
  const visibleItems = queueFilter === "ALL" ? items : items.filter((deal) => deal.status === queueFilter);

  return (
    <section>
      <h1 className="text-2xl font-semibold">Admin Queue</h1>
      {success ? <p className="mt-2 text-sm text-emerald-700">{success}</p> : null}
      <div className="mt-3">
        <label className="text-xs text-slate-600">Filter status:</label>
        <select
          value={queueFilter}
          onChange={(e) => setQueueFilter(e.target.value as QueueFilter)}
          className="ml-2 rounded border px-2 py-1 text-xs"
        >
          <option value="ALL">All</option>
          <option value="SUBMITTED">SUBMITTED</option>
        </select>
      </div>
      <ul className="mt-4 space-y-3">
        {visibleItems.map((deal) => (
          <li key={deal._id} className="rounded border bg-white p-4">
            <p className="font-semibold">{deal.title}</p>
            <p className="text-sm text-slate-600">{deal.restaurantName}</p>
            <p className="mt-1 text-xs text-slate-500">Status: {deal.status}</p>
            {deal.createdAt ? (
              <p className="mt-1 text-xs text-slate-500">
                Created: {new Date(deal.createdAt).toLocaleDateString()}
              </p>
            ) : null}
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => approveDeal(deal._id)}
                className="rounded bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-500"
              >
                Approve
              </button>
              <button
                onClick={() => rejectDeal(deal._id)}
                className="rounded bg-rose-600 px-3 py-1 text-xs font-medium text-white hover:bg-rose-500"
              >
                Reject
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}