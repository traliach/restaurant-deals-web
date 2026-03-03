// Global auth state for the app.
import { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { ReactNode } from "react";

export type Role = "customer" | "owner" | "admin";

type AuthState = {
  token: string | null;
  role: Role | null;
};

type AuthContextValue = AuthState & {
  login: (token: string) => void;
  logout: () => void;
  isLoggedIn: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// JWT payload is base64url-encoded; decode it once and cache the role.
function roleFromToken(token: string): Role | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return json?.role ?? null;
  } catch {
    return null;
  }
}

// Returns true if the token's exp claim is in the past.
function isTokenExpired(token: string): boolean {
  try {
    const payload = token.split(".")[1];
    if (!payload) return true;
    const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    if (!json?.exp) return false;
    return json.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

// Rehydrate from localStorage on refresh — discard expired tokens immediately.
function loadInitialState(): AuthState {
  const token = localStorage.getItem("token");
  if (!token) return { token: null, role: null };
  if (isTokenExpired(token)) {
    localStorage.removeItem("token");
    return { token: null, role: null };
  }
  return { token, role: roleFromToken(token) };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(loadInitialState);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setAuth({ token: null, role: null });
  }, []);

  const login = useCallback((token: string) => {
    localStorage.setItem("token", token);
    setAuth({ token, role: roleFromToken(token) });
  }, []);

  // Listen for 401 events dispatched by api.ts when a request fails auth.
  useEffect(() => {
    function handleExpired() { logout(); }
    window.addEventListener("auth:expired", handleExpired);
    return () => window.removeEventListener("auth:expired", handleExpired);
  }, [logout]);

  const value: AuthContextValue = {
    ...auth,
    login,
    logout,
    isLoggedIn: !!auth.token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
