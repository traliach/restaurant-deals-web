import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <section className="text-center py-16">
      <h1 className="text-5xl font-bold text-slate-300">404</h1>
      <p className="mt-4 text-lg font-semibold text-slate-700">Page not found</p>
      <p className="mt-2 text-sm text-slate-600">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="mt-6 inline-block rounded bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-500"
      >
        Back to Home
      </Link>
    </section>
  );
}
