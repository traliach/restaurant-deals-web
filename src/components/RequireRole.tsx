import { Link } from "react-router-dom";
import type { ReactElement } from "react";
import { useAuth } from "../context/AuthContext";
import type { Role } from "../context/AuthContext";

// Blocks users without the required role.
export function RequireRole({
  children,
  allowed,
}: {
  children: ReactElement;
  allowed: Role[];
}) {
  const { role } = useAuth();
  if (!role || !allowed.includes(role)) {
    return (
      <section>
        <h1 className="text-2xl font-semibold">Access denied</h1>
        <p className="mt-2 text-slate-600">
          You do not have permission for this page. Go back to{" "}
          <Link to="/deals" className="text-indigo-700 hover:underline">Deals</Link>.
        </p>
      </section>
    );
  }
  return children;
}
