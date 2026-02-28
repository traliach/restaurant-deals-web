import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiGet } from "../lib/api";
import { DealCard } from "../components/DealCard";

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
              <DealCard
                key={deal._id}
                id={deal._id}
                title={deal.title}
                restaurantName={deal.restaurantName}
                description={deal.description}
                dealType={deal.dealType}
                discountType={deal.discountType}
                value={deal.value}
              />
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
