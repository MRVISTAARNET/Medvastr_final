/** Live production API (Elastic Beanstalk). Override via Amplify env if needed. */
export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "https://api.medvastr.com/api";

export const API_ORIGIN = API_BASE.replace(/\/api\/?$/, "");

/** Must match backend razorpay.key.id (Razorpay test mode) */
export const RAZORPAY_KEY =
  process.env.NEXT_PUBLIC_RAZORPAY_KEY || "rzp_test_SvSswUyEl4VChG";

export function normalizeMediaUrl(url?: string): string {
  if (!url) return "";
  if (url.startsWith("/api/media/")) return `${API_ORIGIN}${url}`;
  if (
    url.startsWith("http://localhost") ||
    url.startsWith("https://localhost") ||
    url.startsWith("http://127.0.0.1")
  ) {
    const i = url.indexOf("/api/media/");
    if (i !== -1) return `${API_ORIGIN}${url.substring(i)}`;
  }
  return url;
}

export function authHeaders(token?: string | null): HeadersInit {
  const t = token ?? (typeof window !== "undefined" ? localStorage.getItem("token") : null);
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export async function apiFetch(path: string, init?: RequestInit) {
  const url = path.startsWith("http") ? path : `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
  return fetch(url, init);
}
