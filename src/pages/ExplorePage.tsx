import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet } from "../lib/api";
import { PageHeader } from "../components/ui/PageHeader";
import { SurfaceCard } from "../components/ui/SurfaceCard";

type Place = {
  id: string;
  name: string;
  address: string;
  city: string;
  category: string;
  rating: number | null;
  imageUrl: string | null;
  website: string | null;
  phone: string | null;
};

const CITIES = ["New York", "Newark", "Jersey City", "Brooklyn", "Hoboken", "Montclair"];

function StarRating({ rating }: { rating: number | null }) {
  if (!rating) return null;
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span className="flex items-center gap-0.5 text-amber-400 text-xs">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i}>
          {i < full ? "★" : i === full && half ? "½" : "☆"}
        </span>
      ))}
      <span className="ml-1 text-slate-500">{rating}/5</span>
    </span>
  );
}

export function ExplorePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("New York");
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setSearched(true);

    try {
      // Yelp uses location text — pass city name as "near"
      const params = new URLSearchParams({ query: query.trim(), near: `${city}, NJ`, limit: "10" });

      const data = await apiGet<Place[]>(`/api/external/places?${params.toString()}`);
      setPlaces(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
      setPlaces([]);
    } finally {
      setLoading(false);
    }
  }

  function useRestaurant(place: Place) {
    navigate("/portal", {
      state: { prefill: { restaurantName: place.name, yelpId: place.id } },
    });
  }

  return (
    <section className="space-y-8">
      <PageHeader
        eyebrow="Discovery"
        title="Explore Restaurants"
        description="Search real restaurants powered by Yelp and turn them into deal opportunities inside your marketplace."
      />

      <SurfaceCard className="relative overflow-hidden p-6 md:p-8">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-700 opacity-95" />
        <div className="relative">
          <div className="max-w-2xl">
            <p className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur">
              Restaurant source search
            </p>

            <h2 className="mt-5 text-3xl font-bold text-white">
              Find restaurants and create deals faster
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-200 md:text-base">
              Search by keyword and location, browse real restaurant results, then choose
              one to prefill your deal workflow.
            </p>
          </div>

          <form onSubmit={handleSearch} className="mt-8 grid gap-4 md:grid-cols-[1fr_220px_160px]">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search restaurants (e.g. pizza, sushi...)"
              className="h-14 rounded-2xl border border-white/15 bg-white/95 px-4 text-sm text-slate-900 outline-none placeholder:text-slate-400"
              required
            />
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="h-14 rounded-2xl border border-white/15 bg-white/95 px-4 text-sm text-slate-900 outline-none"
            >
              {CITIES.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <button
              type="submit"
              disabled={loading}
              className="h-14 rounded-2xl bg-white px-5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 disabled:opacity-60"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </form>
        </div>
      </SurfaceCard>

      {error ? (
        <SurfaceCard className="p-8 text-center">
          <h3 className="text-xl font-semibold text-slate-900">Search failed</h3>
          <p className="mt-2 text-sm leading-6 text-red-600">{error}</p>
        </SurfaceCard>
      ) : null}

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <SurfaceCard key={index} className="overflow-hidden">
              <div className="h-52 animate-pulse bg-slate-200" />
              <div className="space-y-3 p-5">
                <div className="h-5 w-2/3 animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100" />
                <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
              </div>
            </SurfaceCard>
          ))}
        </div>
      ) : searched && !places.length && !error ? (
        <SurfaceCard className="p-10 text-center">
          <h3 className="text-xl font-semibold text-slate-900">No restaurants yet</h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
            Search by cuisine, city, or restaurant name to discover places you can use
            to create new deals.
          </p>
        </SurfaceCard>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {places.map((place) => (
            <SurfaceCard key={place.id} className="overflow-hidden">
              <img
                src={place.imageUrl || "/images/placeholders/default.svg"}
                alt={place.name}
                className="h-52 w-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/images/placeholders/default.svg";
                }}
              />

              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{place.name}</h3>
                    <p className="mt-1 text-sm text-slate-500">{place.city}</p>
                  </div>
                  {place.rating ? (
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                      ⭐ {place.rating.toFixed(1)}
                    </span>
                  ) : null}
                </div>

                <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                  {place.category || "Restaurant discovery result"}
                </p>

                {place.address ? (
                  <p className="mt-3 text-sm text-slate-500">{place.address}</p>
                ) : null}

                {place.rating ? (
                  <div className="mt-3">
                    <StarRating rating={place.rating} />
                  </div>
                ) : null}

                <div className="mt-5 flex items-center justify-between gap-3">
                  {place.website ? (
                    <a
                      href={place.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      View Source
                    </a>
                  ) : (
                    <span className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-400">
                      No website
                    </span>
                  )}

                  <button
                    onClick={() => useRestaurant(place)}
                    className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-600"
                  >
                    Create Deal
                  </button>
                </div>
              </div>
            </SurfaceCard>
          ))}
        </div>
      )}
    </section>
  );
}
