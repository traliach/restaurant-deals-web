import { Link } from "react-router-dom";
import type { ReactElement } from "react";

type Role = "customer" | "owner" | "admin";

function getTokenRole(): Role | null {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return json?.role ?? null;
  } catch {
    return null;
  }
}

export function RequireRole({
  children,
  allowed,
}: {
  children: ReactElement;
  allowed: Role[];
}) {
  const role = getTokenRole();
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
