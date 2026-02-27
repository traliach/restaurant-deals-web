import { env } from "../config/env";

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${env.apiUrl}${path}`);
  const json = await response.json();
  if (!response.ok || !json?.ok) {
    throw new Error(json?.error || "Request failed");
  }
  return json.data as T;
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(`${env.apiUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await response.json();
  if (!response.ok || !json?.ok) {
    throw new Error(json?.error || "Request failed");
  }
  return json.data as T;
}
