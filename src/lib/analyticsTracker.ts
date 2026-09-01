"use client";

import { API_BASE } from "@/lib/api";

const VISITOR_KEY = "medvastr_vid";
const SESSION_KEY = "medvastr_sid";

function getOrGenerateId(key: string, isSession = false): string {
  if (typeof window === "undefined") return "";
  try {
    const storage = isSession ? sessionStorage : localStorage;
    let id = storage.getItem(key);
    if (!id) {
      id = (isSession ? "s_" : "v_") + Math.random().toString(36).substring(2, 11) + "_" + Date.now();
      storage.setItem(key, id);
    }
    return id;
  } catch {
    return (isSession ? "s_" : "v_") + Math.random().toString(36).substring(2, 11) + "_" + Date.now();
  }
}

export function getVisitorId(): string {
  return getOrGenerateId(VISITOR_KEY, false);
}

export function getSessionId(): string {
  return getOrGenerateId(SESSION_KEY, true);
}

export function trackAnalyticsEvent(
  eventType: string = "PAGE_VIEW",
  eventData?: any,
  overridePageUrl?: string,
  overridePageTitle?: string
): void {
  if (typeof window === "undefined") return;

  try {
    const visitorId = getVisitorId();
    const sessionId = getSessionId();
    const pageUrl = overridePageUrl || window.location.pathname + window.location.search;
    const pageTitle = overridePageTitle || document.title || "Medvarn";
    const referrer = document.referrer || "";

    const payload = {
      visitorId,
      sessionId,
      pageUrl,
      pageTitle,
      referrer,
      eventType,
      eventData: typeof eventData === "object" ? JSON.stringify(eventData) : (eventData || null),
      durationSeconds: 0
    };

    const targetUrl = `${API_BASE}/analytics/track`;
    const jsonString = JSON.stringify(payload);

    if (navigator && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([jsonString], { type: "application/json" });
      const sent = navigator.sendBeacon(targetUrl, blob);
      if (sent) return;
    }

    fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: jsonString,
      keepalive: true
    }).catch(() => {
      // Non-blocking fallback ignored
    });
  } catch {
    // Non-blocking error handling
  }
}
