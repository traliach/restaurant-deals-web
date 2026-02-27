import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
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
  page: number;
  totalPages: number;
  total: number;
};

type DealTypeFilter = "" | "Lunch" | "Carryout" | "Delivery" | "Other";
type SortOption = "newest" | "value";

// Delays API calls until the user stops typing for 300ms.
function useDebounce(value: string, ms = 300) {
  const [debounced, setDebounced] = useState(value);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    timer.current = setTimeout(() => setDebounced(value), ms);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [value, ms]);
  return debounced;
}

export function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [dealType, setDealType] = useState<DealTypeFilter>("");
  const [sort, setSort] = useState<SortOption>("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const loadDeals = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "9");
      if (debouncedSearch.trim()) params.set("q", debouncedSearch.trim());
      if (dealType) params.set("dealType", dealType);
      if (sort === "value") params.set("sort", "value");

      const data = await apiGet<DealsResponse>(`/api/deals?${params}`);
      setDeals(data.items ?? []);
      setTotalPages(data.totalPages ?? 1);
      setTotal(data.total ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load deals");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, dealType, sort]);

  useEffect(() => {
    loadDeals();
  }, [loadDeals]);

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function clearSearch() {
    setSearch("");
    setPage(1);
  }

  function handleTypeChange(value: DealTypeFilter) {
    setDealType(value);
    setPage(1);
  }

  function handleSortChange(value: SortOption) {
    setSort(value);
    setPage(1);
  }

  function formatDiscount(deal: Deal) {
    if (!deal.discountType || deal.value == null) return null;
    if (deal.discountType === "percent") return `${deal.value}% off`;
    if (deal.discountType === "amount") return `$${deal.value} off`;
    if (deal.discountType === "bogo") return "BOGO";
    return deal.discountType;
  }

  return (
    <section>
      <h1 className="text-2xl font-semibold">Deals Explorer</h1>

      {/* Filter controls */}
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-slate-600 mb-1">Search</label>
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search deals..."
              className="w-full rounded border px-3 py-2 pr-8 text-sm"
            />
            {search ? (
              <button
                onClick={clearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label="Clear search"
              >
                &times;
              </button>
            ) : null}
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
          <select
            value={dealType}
            onChange={(e) => handleTypeChange(e.target.value as DealTypeFilter)}
            className="rounded border px-3 py-2 text-sm"
          >
            <option value="">All types</option>
            <option value="Lunch">Lunch</option>
            <option value="Carryout">Carryout</option>
            <option value="Delivery">Delivery</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Sort</label>
          <select
            value={sort}
            onChange={(e) => handleSortChange(e.target.value as SortOption)}
            className="rounded border px-3 py-2 text-sm"
          >
            <option value="newest">Newest</option>
            <option value="value">Best value</option>
          </select>
        </div>
      </div>

      {/* Result count */}
      {!loading && !error ? (
        <p className="mt-3 text-xs text-slate-500">
          {total} deal{total !== 1 ? "s" : ""} found
          {debouncedSearch.trim() ? ` for "${debouncedSearch.trim()}"` : ""}
        </p>
      ) : null}

      {/* Results */}
      {loading ? (
        <p className="mt-6 text-slate-600">Loading deals...</p>
      ) : error ? (
        <p className="mt-6 text-red-600">Error: {error}</p>
      ) : deals.length === 0 ? (
        <p className="mt-6 text-slate-600">No deals found. Try changing your filters.</p>
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {deals.map((deal) => (
              <div key={deal._id} className="flex flex-col rounded-lg border bg-white p-4 hover:shadow transition-shadow">
                <div className="flex items-start justify-between gap-2">
                  <Link to={`/deals/${deal._id}`} className="font-semibold text-indigo-700 hover:underline">
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

          {/* Pagination */}
          {totalPages > 1 ? (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded border px-3 py-1 text-sm disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-slate-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="rounded border px-3 py-1 text-sm disabled:opacity-40"
              >
                Next
              </button>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
