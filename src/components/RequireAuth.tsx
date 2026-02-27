import { Navigate } from "react-router-dom";
import type { ReactElement } from "react";

export function RequireAuth({ children }: { children: ReactElement }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}
