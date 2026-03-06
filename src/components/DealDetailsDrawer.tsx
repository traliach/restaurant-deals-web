/**
 * Customer-facing deal details drawer.
 * Opens from the right when a deal card is clicked on DealsPage / HomePage.
 * Keeps the /deals/:id route for direct URL sharing.
 */
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { addItem } from "../store/cartSlice";
import { useAppDispatch } from "../store/hooks";
import { apiPost } from "../lib/api";

export type DrawerDeal = {
  _id: string;
  title: string;
  restaurantName: string;
  restaurantCity?: string;
  restaurantAddress?: string;
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

type Props = {
  deal: DrawerDeal | null;
  onClose: () => void;
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

export function DealDetailsDrawer({ deal, onClose }: Props) {
  const dispatch = useAppDispatch();
  const [cartMsg, setCartMsg] = useState("");
  const [favMsg, setFavMsg] = useState("");
  const drawerRef = useRef<HTMLDivElement>(null);
  const countdown = useCountdown(deal?.endAt);
  const isExpired = countdown === "Expired";

  // Reset messages when deal changes.
  useEffect(() => {
    setCartMsg("");
    setFavMsg("");
  }, [deal?._id]);

  // Close on Escape.
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  async function saveFavorite() {
    if (!deal) return;
    setFavMsg("");
    try {
      await apiPost(`/api/favorites/${deal._id}`);
      setFavMsg("Saved to favorites!");
    } catch (err) {
      setFavMsg(err instanceof Error ? err.message : "Failed to save");
    }
  }

  if (!deal) return null;

  const discount = formatDiscount(deal.discountType, deal.value);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30"
        onClick={onClose}
        aria-hidden
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col overflow-y-auto bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-base font-semibold text-slate-800">Deal Details</h2>
          <div className="flex items-center gap-3">
            <Link
              to={`/deals/${deal._id}`}
              className="text-xs text-indigo-600 hover:underline"
              onClick={onClose}
            >
              Open full page ↗
            </Link>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 text-xl leading-none"
              aria-label="Close"
            >
              &times;
            </button>
          </div>
        </div>

        <div className="flex-1 p-5 space-y-4">
          {deal.imageUrl && (
            <img
              src={deal.imageUrl}
              alt={deal.title}
              className="h-48 w-full rounded-lg object-cover"
            />
          )}

          {/* Title + badges */}
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <h3 className="text-lg font-bold text-slate-900">{deal.title}</h3>
            <div className="flex flex-wrap gap-1.5">
              {deal.dealType && (
                <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                  {deal.dealType}
                </span>
              )}
              {deal.cuisineType && (
                <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-semibold text-violet-700">
                  {deal.cuisineType}
                </span>
              )}
            </div>
          </div>

          {/* Restaurant + rating */}
          <div className="flex items-center gap-3">
            <p className="font-medium text-slate-700">{deal.restaurantName}</p>
            {deal.yelpRating != null && (
              <span className="text-sm font-semibold text-amber-600">
                ★ {deal.yelpRating.toFixed(1)}
              </span>
            )}
          </div>

          {/* Location */}
          {(deal.restaurantAddress || deal.restaurantCity) && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>📍</span>
              <span>{deal.restaurantAddress ?? deal.restaurantCity}</span>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(
                  deal.restaurantAddress ?? deal.restaurantCity ?? ""
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline"
              >
                Directions
              </a>
            </div>
          )}

          {/* Dietary tags */}
          {deal.dietaryTags && deal.dietaryTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {deal.dietaryTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-medium text-emerald-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          <p className="text-sm text-slate-700 leading-relaxed">{deal.description}</p>

          {/* Expiry countdown */}
          {countdown && (
            <div
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                isExpired
                  ? "bg-red-50 border border-red-200 text-red-600"
                  : "bg-orange-50 border border-orange-200 text-orange-600"
              }`}
            >
              {isExpired ? "This deal has expired." : `Expires in: ${countdown}`}
            </div>
          )}

          {/* Discount highlight */}
          {discount && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3">
              <p className="text-lg font-bold text-emerald-700">{discount}</p>
            </div>
          )}

          {/* Price */}
          {deal.price != null && deal.price > 0 && (
            <p className="text-2xl font-bold text-slate-900">
              ${deal.price.toFixed(2)}
              <span className="ml-2 text-sm font-normal text-slate-400">per order</span>
            </p>
          )}

          {/* Action feedback */}
          {cartMsg && (
            <p className="text-sm font-medium text-emerald-600">{cartMsg}</p>
          )}
          {favMsg && (
            <p className="text-sm text-slate-600">{favMsg}</p>
          )}
        </div>

        {/* Sticky footer actions */}
        <div className="border-t p-4 space-y-2">
          {isExpired ? (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-center text-sm text-red-600 font-medium">
              This deal is no longer available.
            </div>
          ) : (
            <>
              <button
                onClick={() => {
                  dispatch(addItem({
                    dealId: deal._id,
                    title: deal.title,
                    restaurantName: deal.restaurantName,
                    price: deal.price ?? 0,
                  }));
                  setCartMsg("Added to cart!");
                  setTimeout(() => setCartMsg(""), 2500);
                }}
                className="w-full rounded-lg bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors"
              >
                Add to Cart
              </button>
              <button
                onClick={saveFavorite}
                className="w-full rounded-lg border border-indigo-600 py-3 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors"
              >
                ♡ Save to Favorites
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
