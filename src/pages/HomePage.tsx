import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiGet } from "../lib/api";

type Deal = {
  _id: string;
  title: string;
  restaurantName: string;
  description: string;
  dealType?: string;
  discountType?: string;
  value?: number;
};

type DealsResponse = {
  items: Deal[];
};

function formatDiscount(deal: Deal) {
  if (!deal.discountType || deal.value == null) return null;
  if (deal.discountType === "percent") return `${deal.value}% off`;
  if (deal.discountType === "amount") return `$${deal.value} off`;
  if (deal.discountType === "bogo") return "BOGO";
  return deal.discountType;
}

export function HomePage() {
  const { role } = useAuth();
  const [featured, setFeatured] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeatured() {
      try {
        const data = await apiGet<DealsResponse>("/api/deals?limit=3&sort=value");
        setFeatured(data.items ?? []);
      } catch {
        // Non-critical — page still renders without featured deals
      } finally {
        setLoading(false);
      }
    }
    loadFeatured();
  }, []);

  return (
    <section>
      {/* Hero */}
      <div className="rounded-lg bg-indigo-600 px-6 py-12 text-center text-white">
        <h1 className="text-3xl font-bold">Discover Local Restaurant Deals</h1>
        <p className="mx-auto mt-3 max-w-lg text-indigo-100">
          Browse exclusive discounts from restaurants near you. Save your favorites and never miss a deal.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/deals"
            className="rounded-lg bg-white px-5 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50"
          >
            Browse Deals
          </Link>
          {!role ? (
            <Link
              to="/register"
              className="rounded-lg border border-indigo-300 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              Create Account
            </Link>
          ) : null}
          {role === "owner" || role === "admin" ? (
            <Link
              to="/portal"
              className="rounded-lg border border-indigo-300 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              Go to Portal
            </Link>
          ) : null}
          {role === "admin" ? (
            <Link
              to="/admin"
              className="rounded-lg border border-indigo-300 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              Admin Queue
            </Link>
          ) : null}
        </div>
      </div>

      {/* Featured deals */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold">Top Deals</h2>
        {loading ? (
          <p className="mt-4 text-slate-600">Loading featured deals...</p>
        ) : featured.length === 0 ? (
          <p className="mt-4 text-slate-600">No deals published yet. Check back soon!</p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((deal) => (
              <div
                key={deal._id}
                className="flex flex-col rounded-lg border bg-white p-4 hover:shadow transition-shadow"
              >
                <div className="flex items-start justify-between gap-2">
                  <Link
                    to={`/deals/${deal._id}`}
                    className="font-semibold text-indigo-700 hover:underline"
                  >
                    {deal.title}
                  </Link>
                  {deal.dealType ? (
                    <span className="shrink-0 rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                      {deal.dealType}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-slate-600">{deal.restaurantName}</p>
                <p className="mt-2 text-sm text-slate-700 line-clamp-2">{deal.description}</p>
                {formatDiscount(deal) ? (
                  <p className="mt-auto pt-3 text-sm font-semibold text-emerald-700">
                    {formatDiscount(deal)}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        )}
        {featured.length > 0 ? (
          <div className="mt-4 text-center">
            <Link
              to="/deals"
              className="text-sm font-medium text-indigo-600 hover:underline"
            >
              View all deals →
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
