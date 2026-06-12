import { API_BASE } from "./api";

type ApiEnvelope<T> = { success?: boolean; data?: T; message?: string; content?: T };

export async function serverFetchJson<T>(path: string, revalidate = 300): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      next: { revalidate },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as ApiEnvelope<T> & T;
    if (json && typeof json === "object" && "success" in json && json.success && json.data !== undefined) {
      return json.data as T;
    }
    return json as T;
  } catch {
    return null;
  }
}

export async function serverFetchPage<T>(path: string, revalidate = 300): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      next: { revalidate },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
