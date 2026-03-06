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
      <div
        className="fixed inset-0 z-40 bg-black/30"
        onClick={onClose}
        aria-hidden
      />

      <div
        ref={drawerRef}
        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col overflow-y-auto bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-900">Deal Details</h2>
          <div className="flex items-center gap-3">
            <Link
              to={`/deals/${deal._id}`}
              className="text-xs font-medium text-indigo-600 hover:underline"
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

        <div className="flex-1 space-y-5 p-5">
          <div className="overflow-hidden rounded-2xl">
            <img
              src={deal.imageUrl || "/images/placeholders/default.svg"}
              alt={deal.title}
              className="h-52 w-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/images/placeholders/default.svg";
              }}
            />
          </div>

          <div className="border-b border-slate-100 pb-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{deal.title}</h3>
                <div className="mt-2 flex items-center gap-3">
                  <p className="font-medium text-slate-700">{deal.restaurantName}</p>
                  {deal.yelpRating != null ? (
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                      ★ {deal.yelpRating.toFixed(1)}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {deal.dealType ? (
                  <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                    {deal.dealType}
                  </span>
                ) : null}
                {deal.cuisineType ? (
                  <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-semibold text-violet-700">
                    {deal.cuisineType}
                  </span>
                ) : null}
              </div>
            </div>

            {(deal.restaurantAddress || deal.restaurantCity) ? (
              <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
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
            ) : null}
          </div>

          {countdown ? (
            <div
              className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
                isExpired
                  ? "border-red-200 bg-red-50 text-red-600"
                  : "border-orange-200 bg-orange-50 text-orange-700"
              }`}
            >
              {isExpired ? "This deal has expired." : `Expires in: ${countdown}`}
            </div>
          ) : null}

          {discount ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4">
              <p className="text-lg font-bold text-emerald-700">{discount}</p>
            </div>
          ) : null}

          <div className="rounded-2xl bg-slate-50 px-4 py-4">
            <p className="text-sm leading-relaxed text-slate-700">{deal.description}</p>
          </div>

          {deal.dietaryTags && deal.dietaryTags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {deal.dietaryTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}

          {deal.price != null && deal.price > 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">Deal price</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                ${deal.price.toFixed(2)}
                <span className="ml-2 text-sm font-normal text-slate-400">per order</span>
              </p>
            </div>
          ) : null}

          {cartMsg ? (
            <p className="text-sm font-medium text-emerald-600">{cartMsg}</p>
          ) : null}
          {favMsg ? (
            <p className="text-sm text-slate-600">{favMsg}</p>
          ) : null}
        </div>

        <div className="sticky bottom-0 border-t border-slate-200 bg-white p-4 space-y-3">
          {isExpired ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-600">
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
                className="h-12 w-full rounded-xl bg-emerald-600 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Add to Cart
              </button>
              <button
                onClick={saveFavorite}
                className="h-12 w-full rounded-xl border border-indigo-200 bg-indigo-50 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
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
