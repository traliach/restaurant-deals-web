import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { apiGet, apiPost } from "../lib/api";

type Deal = {
  _id: string;
  title: string;
  restaurantName: string;
  description: string;
  dealType?: string;
  discountType?: string;
  value?: number;
  price?: number;
};

export function DealDetailsPage() {
  const { id } = useParams();
  const { addItem } = useCart();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [favMsg, setFavMsg] = useState("");
  const [cartMsg, setCartMsg] = useState("");

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

  function formatDiscount(type?: string, value?: number) {
    if (type === "percent" && value != null) return `${value}% Off`;
    if (type === "amount" && value != null) return `$${value} Off`;
    if (type === "bogo") return "Buy One Get One Free";
    if (type === "other") return "Special Offer";
    return null;
  }

  if (loading) return <p className="text-slate-600">Loading deal...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;
  if (!deal) return <p className="text-slate-600">Deal not found.</p>;

  const discountLabel = formatDiscount(deal.discountType, deal.value);

  return (
    <section className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-bold text-slate-900">{deal.title}</h1>
          {deal.dealType && (
            <span className="shrink-0 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
              {deal.dealType}
            </span>
          )}
        </div>

        <p className="mt-1 text-base font-medium text-slate-600">{deal.restaurantName}</p>

        <p className="mt-4 text-slate-700 leading-relaxed">{deal.description}</p>

        {/* Discount highlight */}
        {discountLabel && (
          <div className="mt-5 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3">
            <p className="text-lg font-bold text-emerald-700">{discountLabel}</p>
          </div>
        )}

        {/* Price */}
        {deal.price != null && deal.price > 0 && (
          <p className="mt-3 text-2xl font-bold text-slate-900">
            ${deal.price.toFixed(2)}
            <span className="ml-2 text-sm font-normal text-slate-400">per order</span>
          </p>
        )}

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => {
              addItem({
                dealId: deal._id,
                title: deal.title,
                restaurantName: deal.restaurantName,
                price: deal.price ?? 0,
              });
              setCartMsg("Added to cart!");
              setTimeout(() => setCartMsg(""), 2000);
            }}
            className="flex-1 rounded-lg bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-500"
          >
            Add to Cart
          </button>
          <button
            onClick={saveFavorite}
            className="flex-1 rounded-lg border border-indigo-600 py-3 text-sm font-semibold text-indigo-600 hover:bg-indigo-50"
          >
            ♡ Save to Favorites
          </button>
        </div>

        {cartMsg && <p className="mt-3 text-center text-sm font-medium text-emerald-600">{cartMsg}</p>}
        {favMsg && <p className="mt-2 text-center text-sm text-slate-600">{favMsg}</p>}
      </div>
    </section>
  );
}
