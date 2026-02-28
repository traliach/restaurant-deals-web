import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiDelete, apiGet } from "../lib/api";
import { DealCard } from "../components/DealCard";

type FavoriteDeal = {
  _id: string;
  title: string;
  restaurantName: string;
  description: string;
};

type FavoriteItem = {
  _id: string;
  dealId: FavoriteDeal;
};

export function FavoritesPage() {
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadFavorites() {
      try {
        const data = await apiGet<FavoriteItem[]>("/api/favorites");
        setItems(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load favorites");
      } finally {
        setLoading(false);
      }
    }
    loadFavorites();
  }, []);

  async function removeFavorite(dealId: string, favoriteId: string) {
    try {
      await apiDelete(`/api/favorites/${dealId}`);
      setItems((prev) => prev.filter((item) => item._id !== favoriteId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove favorite");
    }
  }

  if (loading) return <p className="text-slate-600">Loading favorites...</p>;

  if (error === "unauthenticated") {
    return (
      <section>
        <h1 className="text-2xl font-semibold">Favorites</h1>
        <p className="mt-2 text-slate-600">
          Please <Link to="/login" className="text-indigo-700 hover:underline">login</Link> to view favorites.
        </p>
      </section>
    );
  }

  if (error) return <p className="text-red-600">Error: {error}</p>;
  if (items.length === 0) return <p className="text-slate-600">No favorites yet.</p>;

  return (
    <section>
      <h1 className="text-2xl font-semibold">Favorites</h1>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <DealCard
            key={item._id}
            id={item.dealId._id}
            title={item.dealId.title}
            restaurantName={item.dealId.restaurantName}
            description={item.dealId.description}
          >
            <button
              onClick={() => removeFavorite(item.dealId._id, item._id)}
              className="mt-3 rounded border px-3 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50"
            >
              Remove
            </button>
          </DealCard>
        ))}
      </div>
    </section>
  );
}
