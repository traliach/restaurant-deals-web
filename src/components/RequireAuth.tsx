import { Link } from "react-router-dom";
import type { ReactElement } from "react";

export function RequireAuth({ children }: { children: ReactElement }) {
  const token = localStorage.getItem("token");
  if (!token) {
    return (
      <section>
        <h1 className="text-2xl font-semibold">Login required</h1>
        <p className="mt-2 text-slate-600">
          Please <Link to="/login" className="text-indigo-700 hover:underline">login</Link> to continue.
        </p>
      </section>
    );
  }
  return children;
}
