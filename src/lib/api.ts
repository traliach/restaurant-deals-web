import { env } from "../config/env";

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${env.apiUrl}${path}`);
  const json = await response.json();
  if (!response.ok || !json?.ok) {
    throw new Error(json?.error || "Request failed");
  }
  return json.data as T;
}
