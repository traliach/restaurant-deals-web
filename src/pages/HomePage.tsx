import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BadgeCheck, Clock3, ShieldCheck, Sparkles, MapPin, UtensilsCrossed } from "lucide-react";
import { useAppSelector } from "../store/hooks";
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
};

function TrustRow() {
  const items = [
    {
      Icon: BadgeCheck,
      title: "Verified Deals",
      desc: "Only reviewed and approved offers are shown.",
    },
    {
      Icon: Clock3,
      title: "24h Expiration",
      desc: "Fresh promotions that expire automatically.",
    },
    {
      Icon: ShieldCheck,
      title: "Secure Checkout",
      desc: "Protected payments with Stripe integration.",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {items.map(({ Icon, title, desc }) => (
        <div
          key={title}
          className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-md"
        >
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-900">{title}</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">{desc}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyDealsState() {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
        <UtensilsCrossed className="h-7 w-7" />
      </div>
      <h3 className="mt-4 text-xl font-semibold text-slate-900">No deals published yet</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
        Approved restaurant offers will appear here. Once owners publish deals, customers will be able to browse them and place orders.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Link
          to="/deals"
          className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Explore Deals
        </Link>
        <Link
          to="/register"
          className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Join Now
        </Link>
      </div>
    </div>
  );
}

export function HomePage() {
  const role = useAppSelector((state) => state.auth.role);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [selectedDeal, setSelectedDeal] = useState<DrawerDeal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function loadDeals() {
      try {
        const res = await apiGet<DealsResponse>("/api/deals?limit=6&sort=value");
        if (!ignore) setDeals(res.items ?? []);
      } catch {
        if (!ignore) setDeals([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadDeals();
    return () => { ignore = true; };
  }, []);

  return (
    <section className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Hero */}
        <div className="relative overflow-hidden rounded-[32px] bg-slate-900 shadow-2xl">
          <img
            src="/images/hero-food.webp"
            alt="Restaurant food"
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-slate-950/45" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-900/45 to-indigo-700/35" />

          <div className="relative grid min-h-[430px] items-center gap-10 px-6 py-12 md:grid-cols-2 md:px-10 lg:px-14 lg:py-16">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur">
                <Sparkles className="h-4 w-4" />
                Discover restaurant offers near you
              </div>

              <h1 className="mt-6 text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
                Save on local food,
                <span className="block text-indigo-300">without searching everywhere.</span>
              </h1>

              <p className="mt-5 max-w-xl text-base leading-7 text-slate-200 md:text-lg">
                Restaurant Deals helps customers find verified offers from nearby restaurants, while owners publish promotions in one clean marketplace.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/deals"
                  className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                >
                  Browse Deals
                </Link>

                {!role ? (
                  <Link
                    to="/register"
                    className="rounded-xl border border-white/25 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"
                  >
                    Create Account
                  </Link>
                ) : null}

                {(role === "owner" || role === "admin") && (
                  <Link
                    to="/portal"
                    className="rounded-xl border border-white/25 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"
                  >
                    Go to Portal
                  </Link>
                )}

                {role === "admin" && (
                  <Link
                    to="/admin"
                    className="rounded-xl border border-white/25 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"
                  >
                    Admin Queue
                  </Link>
                )}
              </div>

              <div className="mt-8 flex flex-wrap gap-6 text-sm text-slate-200">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-indigo-300" />
                  Local restaurant offers
                </div>
                <div className="flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4 text-indigo-300" />
                  Admin-approved deals
                </div>
                <div className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-indigo-300" />
                  Limited-time promotions
                </div>
              </div>
            </div>

            {/* Right glass card — desktop only */}
            <div className="hidden md:flex md:justify-end">
              <div className="w-full max-w-sm rounded-3xl border border-white/15 bg-white/10 p-6 text-white shadow-xl backdrop-blur-xl">
                <p className="text-sm font-medium text-indigo-200">Featured experience</p>
                <h3 className="mt-2 text-2xl font-bold">Modern deal discovery</h3>
                <p className="mt-3 text-sm leading-6 text-slate-200">
                  Clean browsing, strong restaurant visibility, and a simple customer journey from discovery to checkout.
                </p>
                <div className="mt-6 space-y-3">
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-sm text-slate-200">Best for customers</p>
                    <p className="mt-1 font-semibold">Quickly compare active offers</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-sm text-slate-200">Best for owners</p>
                    <p className="mt-1 font-semibold">Promote deals in a structured way</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust row — overlaps hero bottom edge */}
        <div className="-mt-8 relative z-10 px-2 md:px-6">
          <TrustRow />
        </div>

        {/* Deals section */}
        <div className="mt-14">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">Marketplace</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">Top Deals</h2>
              <p className="mt-2 text-sm text-slate-600">
                Browse the latest approved restaurant promotions available to customers.
              </p>
            </div>
            <Link
              to="/deals"
              className="hidden rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 md:inline-flex"
            >
              View all deals
            </Link>
          </div>

          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                  <div className="h-44 animate-pulse bg-slate-200" />
                  <div className="space-y-3 p-5">
                    <div className="h-5 w-2/3 animate-pulse rounded bg-slate-200" />
                    <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                    <div className="h-4 w-5/6 animate-pulse rounded bg-slate-100" />
                    <div className="h-10 w-full animate-pulse rounded-xl bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : deals.length ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
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
                  onOpenDrawer={() =>
                    setSelectedDeal({
                      _id: deal._id,
                      title: deal.title,
                      restaurantName: deal.restaurantName,
                      restaurantCity: deal.restaurantCity,
                      restaurantAddress: deal.restaurantAddress,
                      description: deal.description,
                      dealType: deal.dealType,
                      discountType: deal.discountType,
                      value: deal.value,
                      price: deal.price,
                      imageUrl: deal.imageUrl,
                      cuisineType: deal.cuisineType,
                      dietaryTags: deal.dietaryTags,
                      yelpRating: deal.yelpRating,
                      endAt: deal.endAt,
                    })
                  }
                />
              ))}
            </div>
          ) : (
            <EmptyDealsState />
          )}
        </div>
      </div>

      <DealDetailsDrawer deal={selectedDeal} onClose={() => setSelectedDeal(null)} />
    </section>
  );
}
