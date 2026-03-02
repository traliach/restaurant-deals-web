import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet } from "../lib/api";

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
    <section>
      <h1 className="mb-2 text-2xl font-semibold">Explore Restaurants</h1>
      <p className="mb-6 text-sm text-slate-500">
        Search real restaurants powered by Yelp. Use one to create a deal.
      </p>

      <form onSubmit={handleSearch} className="mb-6 flex flex-col gap-3 sm:flex-row">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search restaurants (e.g. pizza, sushi...)"
          className="flex-1 rounded border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
          required
        />
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400 sm:w-48"
        >
          {CITIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {searched && !loading && places.length === 0 && !error && (
        <p className="text-slate-500">No restaurants found. Try a different search.</p>
      )}

      <ul className="grid gap-4 sm:grid-cols-2">
        {places.map((place) => (
          <li key={place.id} className="rounded-lg border bg-white overflow-hidden">
            {place.imageUrl && (
              <img src={place.imageUrl} alt={place.name} className="h-36 w-full object-cover" />
            )}
            <div className="p-4">
              <p className="font-semibold">{place.name}</p>
              <p className="mt-0.5 text-sm text-slate-500">{place.category}</p>
              <StarRating rating={place.rating} />
              {place.address && (
                <p className="mt-1 text-xs text-slate-400">{place.address}</p>
              )}
              <button
                onClick={() => useRestaurant(place)}
                className="mt-3 rounded bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-500"
              >
                Use this Restaurant
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
