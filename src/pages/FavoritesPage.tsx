import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet } from "../lib/api";

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
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item._id} className="rounded border bg-white p-4">
            <Link to={`/deals/${item.dealId._id}`} className="font-semibold text-indigo-700 hover:underline">
              {item.dealId.title}
            </Link>
            <p className="text-sm text-slate-600">{item.dealId.restaurantName}</p>
            <p className="mt-2 text-sm text-slate-700">{item.dealId.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
