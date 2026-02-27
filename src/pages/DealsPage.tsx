import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet } from "../lib/api";

type Deal = {
  _id: string;
  title: string;
  restaurantName: string;
  description: string;
};

type DealsResponse = {
  items?: Deal[];
};

export function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDeals() {
      try {
        const data = await apiGet<DealsResponse>("/api/deals");
        setDeals(data.items ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load deals");
      } finally {
        setLoading(false);
      }
    }
    loadDeals();
  }, []);

  if (loading) return <p className="text-slate-600">Loading deals...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;
  if (deals.length === 0) return <p className="text-slate-600">No deals found.</p>;

  return (
    <section>
      <h1 className="text-2xl font-semibold">Deals Explorer</h1>
      <ul className="mt-4 space-y-3">
        {deals.map((deal) => (
          <li key={deal._id} className="rounded border bg-white p-4">
            <Link to={`/deals/${deal._id}`} className="font-semibold text-indigo-700 hover:underline">
              {deal.title}
            </Link>
            <p className="text-sm text-slate-600">{deal.restaurantName}</p>
            <p className="mt-2 text-sm text-slate-700">{deal.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
