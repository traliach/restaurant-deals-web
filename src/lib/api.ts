// Thin fetch wrapper — unwraps { ok, data } envelope.
import { env } from "../config/env";

// Attach JWT if logged in.
function authHeaders() {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

// Dispatch a global event so AuthContext can clear state on 401.
function handleUnauthorized(status: number) {
  if (status === 401) {
    window.dispatchEvent(new Event("auth:expired"));
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const json = await response.json();
  if (response.status === 401) handleUnauthorized(401);
  if (!response.ok || !json?.ok) {
    throw new Error(json?.error || "Request failed");
  }
  return json.data as T;
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${env.apiUrl}${path}`, {
    headers: { ...authHeaders() },
  });
  return handleResponse<T>(response);
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(`${env.apiUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: body ? JSON.stringify(body) : undefined,
  });
  return handleResponse<T>(response);
}

export async function apiPut<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(`${env.apiUrl}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: body ? JSON.stringify(body) : undefined,
  });
  return handleResponse<T>(response);
}

export async function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(`${env.apiUrl}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: body ? JSON.stringify(body) : undefined,
  });
  return handleResponse<T>(response);
}

export async function apiDelete<T>(path: string): Promise<T> {
  const response = await fetch(`${env.apiUrl}${path}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
  return handleResponse<T>(response);
}
