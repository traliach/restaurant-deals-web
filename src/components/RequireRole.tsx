import { Navigate } from "react-router-dom";
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
  if (!role || !allowed.includes(role)) return <Navigate to="/deals" replace />;
  return children;
}
