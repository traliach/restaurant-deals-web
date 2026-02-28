// Thin fetch wrapper — unwraps { ok, data } envelope.
import { env } from "../config/env";

// Attach JWT if logged in.
function authHeaders() {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${env.apiUrl}${path}`, {
    headers: { ...authHeaders() },
  });
  const json = await response.json();
  if (!response.ok || !json?.ok) {
    throw new Error(json?.error || "Request failed");
  }
  return json.data as T;
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(`${env.apiUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await response.json();
  if (!response.ok || !json?.ok) {
    throw new Error(json?.error || "Request failed");
  }
  return json.data as T;
}

export async function apiPut<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(`${env.apiUrl}${path}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await response.json();
  if (!response.ok || !json?.ok) {
    throw new Error(json?.error || "Request failed");
  }
  return json.data as T;
}

export async function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(`${env.apiUrl}${path}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await response.json();
  if (!response.ok || !json?.ok) {
    throw new Error(json?.error || "Request failed");
  }
  return json.data as T;
}

export async function apiDelete<T>(path: string): Promise<T> {
  const response = await fetch(`${env.apiUrl}${path}`, {
    method: "DELETE",
    headers: {
      ...authHeaders(),
    },
  });
  const json = await response.json();
  if (!response.ok || !json?.ok) {
    throw new Error(json?.error || "Request failed");
  }
  return json.data as T;
}
