import { useEffect, useState } from "react";
import { apiGet } from "../lib/api";

type OwnerDeal = {
  _id: string;
  title: string;
  status: "DRAFT" | "SUBMITTED" | "PUBLISHED" | "REJECTED";
  restaurantName: string;
};

export function PortalPage() {
  const [items, setItems] = useState<OwnerDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOwnerDeals() {
      try {
        const data = await apiGet<OwnerDeal[]>("/api/owner/deals");
        setItems(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load owner deals");
      } finally {
        setLoading(false);
      }
    }
    loadOwnerDeals();
  }, []);

  if (loading) return <p className="text-slate-600">Loading portal...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;
  if (items.length === 0) return <p className="text-slate-600">No owner deals yet.</p>;

  return (
    <section>
      <h1 className="text-2xl font-semibold">Owner Portal</h1>
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
