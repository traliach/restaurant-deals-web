import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { DealDetailsDrawer, type DrawerDeal } from "../components/DealDetailsDrawer";
import { apiGet } from "../lib/api";
import { DealCard } from "../components/DealCard";
import { PageHeader } from "../components/ui/PageHeader";
import { SurfaceCard } from "../components/ui/SurfaceCard";

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

const inputClass =
  "h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100";

const selectClass =
  "h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100";

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
    <section className="space-y-8">
      <PageHeader
        eyebrow="Marketplace"
        title="Deals Explorer"
        description="Discover approved restaurant promotions, compare offers, and open a quick detail view without leaving the page."
      />

      <SurfaceCard className="p-5 md:p-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <div className="xl:col-span-2">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search deals..."
                className={inputClass}
              />
              {search ? (
                <button
                  onClick={() => { setSearch(""); setPage(1); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                  aria-label="Clear search"
                >
                  &times;
                </button>
              ) : null}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Max price ($)
            </label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
              placeholder="Any"
              min={0}
              step={0.01}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              City
            </label>
            <select
              value={city}
              onChange={(e) => { setCity(e.target.value); setPage(1); }}
              className={selectClass}
            >
              <option value="">All cities</option>
              {CITIES.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Cuisine
            </label>
            <select
              value={cuisineType}
              onChange={(e) => { setCuisineType(e.target.value); setPage(1); }}
              className={selectClass}
            >
              <option value="">All cuisines</option>
              {CUISINE_TYPES.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Type
            </label>
            <select
              value={dealType}
              onChange={(e) => { setDealType(e.target.value as DealTypeFilter); setPage(1); }}
              className={selectClass}
            >
              <option value="">All types</option>
              <option value="Lunch">Lunch</option>
              <option value="Carryout">Carryout</option>
              <option value="Delivery">Delivery</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:col-span-2 xl:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Data
              </label>
              <select
                value={source}
                onChange={(e) => { setSource(e.target.value as SourceFilter); setPage(1); }}
                className={selectClass}
              >
                <option value="">All sources</option>
                <option value="seed">Demo</option>
                <option value="yelp">Real (Yelp)</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Sort
              </label>
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value as SortOption); setPage(1); }}
                className={selectClass}
              >
                <option value="newest">Newest</option>
                <option value="value">Best value</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Dietary
          </span>
          {DIETARY_OPTIONS.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleDietaryTag(tag)}
              className={
                dietaryTags.includes(tag)
                  ? "rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700"
                  : "rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
              }
            >
              {tag}
            </button>
          ))}
          {hasActiveFilters ? (
            <button
              onClick={clearAllFilters}
              className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
            >
              Clear all
            </button>
          ) : null}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
          <p className="text-sm text-slate-500">
            {!loading && !error ? `${total} deal${total !== 1 ? "s" : ""} found` : "Filtering marketplace..."}
          </p>
          <div className="hidden text-sm text-slate-500 md:block">
            Browse active offers by price, city, cuisine, and type.
          </div>
        </div>
      </SurfaceCard>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <SurfaceCard key={index} className="overflow-hidden">
              <div className="h-48 animate-pulse bg-slate-200" />
              <div className="space-y-3 p-5">
                <div className="h-5 w-2/3 animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-slate-100" />
                <div className="h-10 w-full animate-pulse rounded-xl bg-slate-200" />
              </div>
            </SurfaceCard>
          ))}
        </div>
      ) : error ? (
        <SurfaceCard className="p-8 text-center">
          <h2 className="text-xl font-semibold text-slate-900">Could not load deals</h2>
          <p className="mt-2 text-sm leading-6 text-red-600">{error}</p>
        </SurfaceCard>
      ) : deals.length === 0 ? (
        <SurfaceCard className="p-10 text-center">
          <h2 className="text-xl font-semibold text-slate-900">No matching deals</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
            Try broadening your search or clearing some filters to see more published offers.
          </p>
        </SurfaceCard>
      ) : (
        <>
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
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
                imageUrl={deal.imageUrl}
                cuisineType={deal.cuisineType}
                dietaryTags={deal.dietaryTags}
                yelpRating={deal.yelpRating}
                endAt={deal.endAt}
                onOpenDrawer={() => setDrawerDeal(deal)}
              />
            ))}
          </div>

          {totalPages > 1 ? (
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-slate-600">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
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
