import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { apiGet } from "../lib/api";
import { DealCard } from "../components/DealCard";
import { DealDetailsDrawer, type DrawerDeal } from "../components/DealDetailsDrawer";

type Deal = {
  _id: string;
  title: string;
  restaurantName: string;
  restaurantCity?: string;
  restaurantAddress?: string;
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
};

type DealsResponse = {
  items: Deal[];
  page: number;
  totalPages: number;
  total: number;
};

type DealTypeFilter = "" | "Lunch" | "Carryout" | "Delivery" | "Other";
type SourceFilter = "" | "seed" | "yelp";
type SortOption = "newest" | "value";

const CITIES = ["Newark", "Jersey City", "New York", "Brooklyn", "Hoboken", "Montclair"];
const CUISINE_TYPES = ["French", "Italian", "Spanish", "American", "Asian", "Mexican", "Mediterranean", "Other"];
const DIETARY_OPTIONS = ["Vegan", "Vegetarian", "Gluten-Free", "Halal", "Keto", "Dairy-Free"];

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
  const [searchParams] = useSearchParams();

  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const debouncedSearch = useDebounce(search);
  const [dealType, setDealType] = useState<DealTypeFilter>((searchParams.get("dealType") as DealTypeFilter) ?? "");
  const [city, setCity] = useState(searchParams.get("city") ?? "");
  const [source, setSource] = useState<SourceFilter>((searchParams.get("source") as SourceFilter) ?? "");
  const [maxPrice, setMaxPrice] = useState<string>(searchParams.get("maxPrice") ?? "");
  const [sort, setSort] = useState<SortOption>((searchParams.get("sort") as SortOption) ?? "newest");
  const [cuisineType, setCuisineType] = useState(searchParams.get("cuisineType") ?? "");
  const [dietaryTags, setDietaryTags] = useState<string[]>(
    searchParams.get("dietaryTags") ? searchParams.get("dietaryTags")!.split(",") : []
  );
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [drawerDeal, setDrawerDeal] = useState<DrawerDeal | null>(null);

  useEffect(() => {
    setSearch(searchParams.get("q") ?? "");
    setDealType((searchParams.get("dealType") as DealTypeFilter) ?? "");
    setCity(searchParams.get("city") ?? "");
    setSource((searchParams.get("source") as SourceFilter) ?? "");
    setMaxPrice(searchParams.get("maxPrice") ?? "");
    setSort((searchParams.get("sort") as SortOption) ?? "newest");
    setCuisineType(searchParams.get("cuisineType") ?? "");
    setDietaryTags(searchParams.get("dietaryTags") ? searchParams.get("dietaryTags")!.split(",") : []);
    setPage(1);
  }, [searchParams]);

  function toggleDietaryTag(tag: string) {
    setDietaryTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
    setPage(1);
  }

  const hasActiveFilters = !!(search || dealType || city || source || maxPrice || cuisineType || dietaryTags.length);

  function clearAllFilters() {
    setSearch(""); setDealType(""); setCity(""); setSource("" as SourceFilter);
    setMaxPrice(""); setCuisineType(""); setDietaryTags([]); setPage(1);
  }

  const loadDeals = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "9");
      if (debouncedSearch.trim()) params.set("q", debouncedSearch.trim());
      if (dealType) params.set("dealType", dealType);
      if (city) params.set("city", city);
      if (source) params.set("source", source);
      if (maxPrice) params.set("maxPrice", maxPrice);
      if (sort === "value") params.set("sort", "value");
      if (cuisineType) params.set("cuisineType", cuisineType);
      if (dietaryTags.length) params.set("dietaryTags", dietaryTags.join(","));

      const data = await apiGet<DealsResponse>(`/api/deals?${params}`);
      setDeals(data.items ?? []);
      setTotalPages(data.totalPages ?? 1);
      setTotal(data.total ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load deals");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, dealType, city, source, maxPrice, sort, cuisineType, dietaryTags]);

  useEffect(() => { loadDeals(); }, [loadDeals]);

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
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search deals..."
              className="w-full rounded border px-3 py-2 pr-8 text-sm"
            />
            {search ? (
              <button
                onClick={() => { setSearch(""); setPage(1); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label="Clear search"
              >
                &times;
              </button>
            ) : null}
          </div>
        </div>

        <div className="w-28">
          <label className="block text-xs font-medium text-slate-600 mb-1">Max price ($)</label>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
            placeholder="Any"
            min={0}
            step={0.01}
            className="w-full rounded border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">City</label>
          <select
            value={city}
            onChange={(e) => { setCity(e.target.value); setPage(1); }}
            className="rounded border px-3 py-2 text-sm"
          >
            <option value="">All cities</option>
            {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Cuisine</label>
          <select
            value={cuisineType}
            onChange={(e) => { setCuisineType(e.target.value); setPage(1); }}
            className="rounded border px-3 py-2 text-sm"
          >
            <option value="">All cuisines</option>
            {CUISINE_TYPES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
          <select
            value={dealType}
            onChange={(e) => { setDealType(e.target.value as DealTypeFilter); setPage(1); }}
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
          <label className="block text-xs font-medium text-slate-600 mb-1">Data</label>
          <select
            value={source}
            onChange={(e) => { setSource(e.target.value as SourceFilter); setPage(1); }}
            className="rounded border px-3 py-2 text-sm"
          >
            <option value="">All sources</option>
            <option value="seed">Demo</option>
            <option value="yelp">Real (Yelp)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Sort</label>
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value as SortOption); setPage(1); }}
            className="rounded border px-3 py-2 text-sm"
          >
            <option value="newest">Newest</option>
            <option value="value">Best value</option>
          </select>
        </div>
      </div>

      {/* Dietary tags multi-select */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-slate-600">Dietary:</span>
        {DIETARY_OPTIONS.map((tag) => (
          <button
            key={tag}
            onClick={() => toggleDietaryTag(tag)}
            className={`rounded-full border px-3 py-0.5 text-xs font-medium transition-colors ${
              dietaryTags.includes(tag)
                ? "border-emerald-500 bg-emerald-500 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-emerald-400"
            }`}
          >
            {tag}
          </button>
        ))}
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="ml-2 rounded-full border border-red-200 bg-red-50 px-3 py-0.5 text-xs font-medium text-red-600 hover:bg-red-100"
          >
            Clear all
          </button>
        )}
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
              <DealCard
                key={deal._id}
                id={deal._id}
                title={deal.title}
                restaurantName={deal.restaurantName}
                restaurantCity={deal.restaurantCity}
                description={deal.description}
                dealType={deal.dealType}
                discountType={deal.discountType}
                value={deal.value}
                price={deal.price}
                cuisineType={deal.cuisineType}
                dietaryTags={deal.dietaryTags}
                yelpRating={deal.yelpRating}
                endAt={deal.endAt}
                onOpenDrawer={() => setDrawerDeal(deal)}
              />
            ))}
          </div>

          {totalPages > 1 ? (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded border px-3 py-1 text-sm disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-slate-600">Page {page} of {totalPages}</span>
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

      <DealDetailsDrawer deal={drawerDeal} onClose={() => setDrawerDeal(null)} />
    </section>
  );
}
