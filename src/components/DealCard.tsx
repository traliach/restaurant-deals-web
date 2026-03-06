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
  imageUrl?: string;
  cuisineType?: string;
  dietaryTags?: string[];
  yelpRating?: number;
  endAt?: string;
  /** When provided, clicking the card opens the quick-view drawer instead of navigating. */
  onOpenDrawer?: () => void;
  children?: ReactNode;
};

function getFallbackImage(title?: string, cuisineType?: string) {
  const text = `${title ?? ""} ${cuisineType ?? ""}`.toLowerCase();
  if (text.includes("pizza"))   return "/images/placeholders/pizza.jpg";
  if (text.includes("burger"))  return "/images/placeholders/burger.jpg";
  if (text.includes("sushi"))   return "/images/placeholders/sushi.jpg";
  if (text.includes("dessert") || text.includes("cake")) return "/images/placeholders/dessert.jpg";
  if (text.includes("salad") || text.includes("vegan"))  return "/images/placeholders/salad.jpg";
  return "/images/placeholders/default.svg";
}

export function DealCard({
  id, title, restaurantName, restaurantCity, description,
  dealType, price, imageUrl,
  cuisineType, dietaryTags, yelpRating, onOpenDrawer, children,
  // accepted but not rendered — kept for API compatibility with DealsPage/FavoritesPage
  discountType: _dt, value: _val, endAt: _end,
}: DealCardProps) {

  return (
    <Link
      to={`/deals/${id}`}
      onClick={(e) => { if (onOpenDrawer) { e.preventDefault(); onOpenDrawer(); } }}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      {/* Thumbnail */}
      <div className="relative overflow-hidden">
        <img
          src={imageUrl || getFallbackImage(title, cuisineType)}
          alt={title}
          className="h-48 w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          loading="lazy"
          onError={(e) => { e.currentTarget.src = "/images/placeholders/default.svg"; }}
        />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />
        {dealType ? (
          <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-800 shadow-sm backdrop-blur">
            {dealType}
          </span>
        ) : null}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="line-clamp-1 text-lg font-semibold text-slate-900">{title}</h3>
            <p className="mt-1 text-sm text-slate-500">
              {restaurantName}
              {restaurantCity && <span className="text-slate-400"> · {restaurantCity}</span>}
            </p>
          </div>
          {yelpRating != null ? (
            <div className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
              ⭐ {yelpRating.toFixed(1)}
            </div>
          ) : null}
        </div>

        <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{description}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {cuisineType ? (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
              {cuisineType}
            </span>
          ) : null}
          {dietaryTags?.slice(0, 2).map((tag) => (
            <span key={tag} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-auto pt-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Deal price</p>
              <p className="text-xl font-bold text-slate-900">
                {typeof price === "number" && price > 0 ? `$${price.toFixed(2)}` : "View offer"}
              </p>
            </div>
            <span className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition group-hover:bg-indigo-600">
              View Deal
            </span>
          </div>
        </div>

        {/* Action slot — used by FavoritesPage for Add to Cart / Remove buttons */}
        {children && (
          <div onClick={(e) => e.preventDefault()}>{children}</div>
        )}
      </div>
    </Link>
  );
}
