import { useEffect, useState } from "react";
import { apiGet } from "../lib/api";

type SubmittedDeal = {
  _id: string;
  title: string;
  restaurantName: string;
  status: "SUBMITTED";
};

export function AdminPage() {
  const [items, setItems] = useState<SubmittedDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  if (loading) return <p className="text-slate-600">Loading admin queue...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;
  if (items.length === 0) return <p className="text-slate-600">No submitted deals.</p>;

  return (
    <section>
      <h1 className="text-2xl font-semibold">Admin Queue</h1>
      <ul className="mt-4 space-y-3">
        {items.map((deal) => (
          <li key={deal._id} className="rounded border bg-white p-4">
            <p className="font-semibold">{deal.title}</p>
            <p className="text-sm text-slate-600">{deal.restaurantName}</p>
            <p className="mt-1 text-xs text-slate-500">Status: {deal.status}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}