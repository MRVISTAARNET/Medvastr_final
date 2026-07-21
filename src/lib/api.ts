/** Live production API (Elastic Beanstalk). Override via Amplify env if needed. */
export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "https://api.medvastr.com/api";

export const API_ORIGIN = API_BASE.replace(/\/api\/?$/, "");

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://www.medvastr.com";

/** Set NEXT_PUBLIC_RAZORPAY_KEY in production (Razorpay dashboard). */
export const RAZORPAY_KEY = process.env.NEXT_PUBLIC_RAZORPAY_KEY || "";

export const TOKEN_KEY = "token";
export const UNAUTHORIZED_EVENT = "mv:unauthorized";

const DEFAULT_TIMEOUT_MS = 30_000;

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export function normalizeMediaUrl(url?: string): string {
  if (!url) return "";
  if (url.startsWith("/api/media/")) return `${API_ORIGIN}${url}`;

  const isOldHttp = url.startsWith("http://api.medvastr.com");
  const isLocal =
    url.startsWith("http://localhost") ||
    url.startsWith("https://localhost") ||
    url.startsWith("http://127.0.0.1");

  if (isOldHttp || isLocal) {
    const i = url.indexOf("/api/media/");
    if (i !== -1) return `${API_ORIGIN}${url.substring(i)}`;
  }

  if (url.startsWith("http://api.medvastr.com")) {
    return url.replace("http://", "https://");
  }

  return url;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
}

export function authHeaders(token?: string | null): HeadersInit {
  const t = token ?? getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

function handleUnauthorized(status: number): void {
  if (status === 401 && typeof window !== "undefined") {
    clearToken();
  }
}

/** Low-level fetch with timeout and 401 handling. */
export async function apiRequest<T = unknown>(
  path: string,
  init?: RequestInit & { timeoutMs?: number; skipAuth?: boolean }
): Promise<{ response: Response; data: T }> {
  const url = path.startsWith("http")
    ? path
    : `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;

  const controller = new AbortController();
  const timeoutMs = init?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type") && init?.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (!init?.skipAuth && !headers.has("Authorization")) {
    const token = getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  try {
    const response = await fetch(url, {
      ...init,
      headers,
      signal: controller.signal,
    });

    handleUnauthorized(response.status);

    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? ((await response.json()) as T)
      : ((await response.text()) as T);

    return { response, data };
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiError(0, "Request timed out. Please try again.");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

/** Typed helper for Medvastr `{ success, data, message }` responses. */
export async function apiJson<T>(
  path: string,
  init?: RequestInit & { timeoutMs?: number; skipAuth?: boolean }
): Promise<ApiEnvelope<T>> {
  const { response, data } = await apiRequest<ApiEnvelope<T>>(path, init);
  if (!response.ok && !(data as ApiEnvelope<T>)?.message) {
    throw new ApiError(response.status, `Request failed (${response.status})`, data);
  }
  return data;
}

