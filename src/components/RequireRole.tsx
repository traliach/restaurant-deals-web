import { Link } from "react-router-dom";
import type { ReactElement } from "react";
import type { Role } from "../store/authSlice";
import { useAppSelector } from "../store/hooks";

// Blocks users without the required role.
export function RequireRole({
  children,
  allowed,
}: {
  children: ReactElement;
  allowed: Role[];
}) {
  const role = useAppSelector((state) => state.auth.role);
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
