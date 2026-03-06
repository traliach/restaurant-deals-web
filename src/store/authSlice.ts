import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type Role = "customer" | "owner" | "admin";

type AuthState = {
  token: string | null;
  role: Role | null;
};

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

function loadInitialState(): AuthState {
  const token = localStorage.getItem("token");
  if (!token) return { token: null, role: null };
  if (isTokenExpired(token)) {
    localStorage.removeItem("token");
    return { token: null, role: null };
  }
  return { token, role: roleFromToken(token) };
}

const initialState: AuthState = loadInitialState();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login(state, action: PayloadAction<string>) {
      localStorage.setItem("token", action.payload);
      state.token = action.payload;
      state.role = roleFromToken(action.payload);
    },
    logout(state) {
      localStorage.removeItem("token");
      state.token = null;
      state.role = null;
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
