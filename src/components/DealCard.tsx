// Reusable deal card used across DealsPage, HomePage, and FavoritesPage.
import { Link } from "react-router-dom";
import type { ReactNode } from "react";

type DealCardProps = {
  id: string;
  title: string;
  restaurantName: string;
  restaurantCity?: string;
  description: string;
  dealType?: string;
  discountType?: string;
  value?: number;
  price?: number;
  cuisineType?: string;
  dietaryTags?: string[];
  yelpRating?: number;
  endAt?: string;
  /** When provided, clicking the card calls this instead of navigating to /deals/:id */
  onOpenDrawer?: () => void;
  children?: ReactNode;
};

function formatDiscount(discountType?: string, value?: number) {
  if (!discountType || value == null) return null;
  if (discountType === "percent") return `${value}% off`;
  if (discountType === "amount") return `$${value} off`;
  if (discountType === "bogo") return "BOGO";
  return discountType;
}

function formatCountdown(endAt?: string): string | null {
  if (!endAt) return null;
  const diff = new Date(endAt).getTime() - Date.now();
  if (diff <= 0) return "Expired";
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `${days}d ${hours}h left`;
  const mins = Math.floor((diff % 3600000) / 60000);
  return hours > 0 ? `${hours}h ${mins}m left` : `${mins}m left`;
}

export function DealCard({
  id, title, restaurantName, restaurantCity, description,
  dealType, discountType, value, price,
  cuisineType, dietaryTags, yelpRating, endAt, onOpenDrawer, children,
}: DealCardProps) {
  const discount = formatDiscount(discountType, value);
  const countdown = formatCountdown(endAt);
  const isExpired = countdown === "Expired";

  return (
    <Link
      to={`/deals/${id}`}
      onClick={(e) => { if (onOpenDrawer) { e.preventDefault(); onOpenDrawer(); } }}
      className="flex flex-col rounded-lg border bg-white p-4 hover:shadow-md transition-shadow hover:border-indigo-200"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-semibold text-indigo-700">{title}</span>
        <div className="flex shrink-0 flex-col items-end gap-1">
          {dealType ? (
            <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{dealType}</span>
          ) : null}
          {cuisineType ? (
            <span className="rounded bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-600">{cuisineType}</span>
          ) : null}
        </div>
      </div>

      <p className="mt-1 text-sm text-slate-600">
        {restaurantName}
        {restaurantCity && <span className="text-slate-400"> · {restaurantCity}</span>}
      </p>

      <p className="mt-2 text-sm text-slate-700 line-clamp-2">{description}</p>

      {dietaryTags && dietaryTags.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1">
          {dietaryTags.map((tag) => (
            <span key={tag} className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700 border border-emerald-200">
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-auto pt-3 flex items-center justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          {discount ? (
            <span className="text-sm font-semibold text-emerald-700">{discount}</span>
          ) : <span />}
          {yelpRating != null ? (
            <span className="text-xs text-amber-600">★ {yelpRating.toFixed(1)}</span>
          ) : null}
        </div>
        <div className="flex flex-col items-end gap-0.5">
          {price != null && price > 0 ? (
            <span className="text-sm font-bold text-slate-800">${price.toFixed(2)}</span>
          ) : null}
          {countdown ? (
            <span className={`text-xs font-medium ${isExpired ? "text-red-500" : "text-orange-500"}`}>
              {countdown}
            </span>
          ) : null}
        </div>
      </div>

      {/* Action buttons — stop propagation so they don't trigger the card link */}
      {children && (
        <div onClick={(e) => e.preventDefault()}>{children}</div>
      )}
    </Link>
  );
}
