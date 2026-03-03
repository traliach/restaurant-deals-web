import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { apiGet, apiPost } from "../lib/api";

type Deal = {
  _id: string;
  title: string;
  restaurantName: string;
  restaurantAddress?: string;
  restaurantCity?: string;
  description: string;
  dealType?: string;
  discountType?: string;
  value?: number;
  price?: number;
  imageUrl?: string;
  cuisineType?: string;
  dietaryTags?: string[];
  yelpRating?: number;
  endAt?: string;
};

function formatDiscount(type?: string, value?: number) {
  if (type === "percent" && value != null) return `${value}% Off`;
  if (type === "amount" && value != null) return `$${value} Off`;
  if (type === "bogo") return "Buy One Get One Free";
  if (type === "other") return "Special Offer";
  return null;
}

function useCountdown(endAt?: string) {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    if (!endAt) return;
    function calc() {
      const diff = new Date(endAt!).getTime() - Date.now();
      if (diff <= 0) { setLabel("Expired"); return; }
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      if (days > 0) setLabel(`${days}d ${hours}h ${mins}m left`);
      else if (hours > 0) setLabel(`${hours}h ${mins}m ${secs}s left`);
      else setLabel(`${mins}m ${secs}s left`);
    }
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [endAt]);

  return label;
}

export function DealDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [favMsg, setFavMsg] = useState("");
  const [cartMsg, setCartMsg] = useState("");

  const countdown = useCountdown(deal?.endAt);
  const isExpired = countdown === "Expired";

  useEffect(() => {
    async function loadDeal() {
      if (!id) { setError("Missing deal id"); setLoading(false); return; }
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

  const discountLabel = formatDiscount(deal.discountType, deal.value);

  return (
    <section className="mx-auto max-w-2xl">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600"
      >
        ← Back
      </button>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        {deal.imageUrl && (
          <img src={deal.imageUrl} alt={deal.title} className="h-56 w-full object-cover" />
        )}

        <div className="p-6">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-900">{deal.title}</h1>
            <div className="flex flex-wrap gap-2">
              {deal.dealType && (
                <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                  {deal.dealType}
                </span>
              )}
              {deal.cuisineType && (
                <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
                  {deal.cuisineType}
                </span>
              )}
            </div>
          </div>

          <div className="mt-2 flex items-center gap-3">
            <p className="text-base font-medium text-slate-600">{deal.restaurantName}</p>
            {deal.yelpRating != null && (
              <span className="text-sm font-semibold text-amber-600">★ {deal.yelpRating.toFixed(1)}</span>
            )}
          </div>

          {(deal.restaurantAddress || deal.restaurantCity) && (
            <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
              <span>📍</span>
              <span>{deal.restaurantAddress ?? deal.restaurantCity}</span>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(deal.restaurantAddress ?? deal.restaurantCity ?? "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline"
              >
                Get Directions
              </a>
            </div>
          )}

          {deal.dietaryTags && deal.dietaryTags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {deal.dietaryTags.map((tag) => (
                <span key={tag} className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-0.5 text-xs font-medium text-emerald-700">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <p className="mt-4 text-slate-700 leading-relaxed">{deal.description}</p>

          {/* Expiration countdown */}
          {countdown && (
            <div className={`mt-4 rounded-lg px-4 py-2 text-sm font-semibold ${
              isExpired
                ? "bg-red-50 border border-red-200 text-red-600"
                : "bg-orange-50 border border-orange-200 text-orange-600"
            }`}>
              {isExpired ? "This deal has expired." : `Expires in: ${countdown}`}
            </div>
          )}

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

          {/* Actions — disabled when expired */}
          {isExpired ? (
            <div className="mt-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-center text-sm text-red-600 font-medium">
              This deal is no longer available.
            </div>
          ) : (
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => {
                  addItem({ dealId: deal._id, title: deal.title, restaurantName: deal.restaurantName, price: deal.price ?? 0 });
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
          )}

          {cartMsg && <p className="mt-3 text-center text-sm font-medium text-emerald-600">{cartMsg}</p>}
          {favMsg && <p className="mt-2 text-center text-sm text-slate-600">{favMsg}</p>}
        </div>
      </div>
    </section>
  );
}
