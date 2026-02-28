// Reusable deal card used across DealsPage, HomePage, and FavoritesPage.
import { Link } from "react-router-dom";
import type { ReactNode } from "react";

type DealCardProps = {
  id: string;
  title: string;
  restaurantName: string;
  description: string;
  dealType?: string;
  discountType?: string;
  value?: number;
  children?: ReactNode;
};

function formatDiscount(discountType?: string, value?: number) {
  if (!discountType || value == null) return null;
  if (discountType === "percent") return `${value}% off`;
  if (discountType === "amount") return `$${value} off`;
  if (discountType === "bogo") return "BOGO";
  return discountType;
}

export function DealCard({ id, title, restaurantName, description, dealType, discountType, value, children }: DealCardProps) {
  const discount = formatDiscount(discountType, value);

  return (
    <Link
      to={`/deals/${id}`}
      className="flex flex-col rounded-lg border bg-white p-4 hover:shadow-md transition-shadow hover:border-indigo-200"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-semibold text-indigo-700">{title}</span>
        {dealType ? (
          <span className="shrink-0 rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
            {dealType}
          </span>
        ) : null}
      </div>
      <p className="mt-1 text-sm text-slate-600">{restaurantName}</p>
      <p className="mt-2 text-sm text-slate-700 line-clamp-2">{description}</p>
      {discount ? (
        <p className="mt-auto pt-3 text-sm font-semibold text-emerald-700">{discount}</p>
      ) : null}
      {/* Action buttons — stop propagation so they don't trigger the card link */}
      {children && (
        <div onClick={(e) => e.preventDefault()}>{children}</div>
      )}
    </Link>
  );
}
