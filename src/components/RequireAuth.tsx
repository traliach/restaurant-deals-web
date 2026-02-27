import { Link } from "react-router-dom";
import type { ReactElement } from "react";
import { useAuth } from "../context/AuthContext";

// Blocks unauthenticated users from protected routes.
export function RequireAuth({ children }: { children: ReactElement }) {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) {
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
