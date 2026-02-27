import { createContext, useContext, useState, useCallback } from "react";
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

// JWT payload is base64url-encoded; decode it once and cache the role
// so we never re-parse on every render.
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

function loadInitialState(): AuthState {
  const token = localStorage.getItem("token");
  if (!token) return { token: null, role: null };
  return { token, role: roleFromToken(token) };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(loadInitialState);

  const login = useCallback((token: string) => {
    localStorage.setItem("token", token);
    setAuth({ token, role: roleFromToken(token) });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setAuth({ token: null, role: null });
  }, []);

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
