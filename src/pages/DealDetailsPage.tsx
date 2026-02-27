import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiGet, apiPost } from "../lib/api";

type Deal = {
  _id: string;
  title: string;
  restaurantName: string;
  description: string;
  dealType?: string;
  discountType?: string;
  value?: number;
};

export function DealDetailsPage() {
  const { id } = useParams();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [favMsg, setFavMsg] = useState("");

  useEffect(() => {
    async function loadDeal() {
      if (!id) {
        setError("Missing deal id");
        setLoading(false);
        return;
      }
      try {
        const data = await apiGet<Deal>(`/api/deals/${id}`);
        setDeal(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load deal");
      } finally {
        setLoading(false);
      }
    }
    loadDeal();
  }, [id]);

  async function saveFavorite() {
    if (!deal?._id) return;
    setFavMsg("");
    try {
      await apiPost(`/api/favorites/${deal._id}`);
      setFavMsg("Saved to favorites.");
    } catch (err) {
      setFavMsg(err instanceof Error ? err.message : "Failed to save favorite.");
    }
  }

  if (loading) return <p className="text-slate-600">Loading deal...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;
  if (!deal) return <p className="text-slate-600">Deal not found.</p>;

  return (
    <section>
      <h1 className="text-2xl font-semibold">{deal.title}</h1>
      <p className="mt-1 text-slate-600">{deal.restaurantName}</p>
      <p className="mt-3 text-slate-700">{deal.description}</p>
      <p className="mt-4 text-sm text-slate-500">
        {deal.dealType} | {deal.discountType} | {deal.value ?? "-"}
      </p>
      <button
        onClick={saveFavorite}
        className="mt-4 rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
      >
        Save Favorite
      </button>
      {favMsg ? <p className="mt-2 text-sm text-slate-600">{favMsg}</p> : null}
    </section>
  );
}
