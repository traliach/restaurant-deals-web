import { Link } from "react-router-dom";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div>
          <p className="text-lg font-bold text-slate-900">
            <span className="text-indigo-600">Restaurant</span> Deals
          </p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-slate-600">
            Find local restaurant deals in one place.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Navigation
          </p>
          <div className="mt-4 flex flex-col gap-3 text-sm text-slate-600">
            <Link to="/deals" className="transition hover:text-slate-900">
              Deals
            </Link>
            <Link to="/favorites" className="transition hover:text-slate-900">
              Favorites
            </Link>
            <Link to="/explore" className="transition hover:text-slate-900">
              Explore Restaurants
            </Link>
            <Link to="/register" className="transition hover:text-slate-900">
              Register
            </Link>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Stack
          </p>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            MERN, TypeScript, Tailwind, Stripe, and Yelp.
          </p>
        </div>
      </div>

      <div className="border-t border-slate-200">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-sm text-slate-500 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>© 2026 Restaurant Deals</p>
          <p>Built by trachdev.</p>
        </div>
      </div>
    </footer>
  );
}
