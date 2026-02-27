import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiPost } from "../lib/api";

type RegisterData = {
  token: string;
};

type RoleOption = "customer" | "owner";

export function RegisterPage() {
  const navigate = useNavigate();
  const { isLoggedIn, login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState<RoleOption>("customer");
  const [restaurantId, setRestaurantId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (isLoggedIn) {
    navigate("/deals");
    return null;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const body: Record<string, string> = { email, password, role };
      if (role === "owner") body.restaurantId = restaurantId;

      const data = await apiPost<RegisterData>("/api/auth/register", body);
      login(data.token);
      navigate("/deals");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="max-w-md">
      <h1 className="text-2xl font-semibold">Create Account</h1>
      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full rounded border px-3 py-2"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full rounded border px-3 py-2"
          minLength={6}
          required
        />
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Confirm password"
          className="w-full rounded border px-3 py-2"
          minLength={6}
          required
        />

        <fieldset className="space-y-1">
          <legend className="text-sm font-medium text-slate-700">Account type</legend>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="role"
              value="customer"
              checked={role === "customer"}
              onChange={() => setRole("customer")}
            />
            Customer
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="role"
              value="owner"
              checked={role === "owner"}
              onChange={() => setRole("owner")}
            />
            Restaurant Owner
          </label>
        </fieldset>

        {role === "owner" ? (
          <input
            value={restaurantId}
            onChange={(e) => setRestaurantId(e.target.value)}
            placeholder="Restaurant ID (e.g. demo-grill)"
            className="w-full rounded border px-3 py-2"
            required
          />
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Sign up"}
        </button>
      </form>

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

      <p className="mt-4 text-sm text-slate-600">
        Already have an account?{" "}
        <Link to="/login" className="text-indigo-700 hover:underline">Sign in</Link>
      </p>
    </section>
  );
}
