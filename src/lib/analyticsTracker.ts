"use client";

import { API_BASE } from "@/lib/api";

const VISITOR_KEY = "medvastr_vid";
const SESSION_KEY = "medvastr_sid";
const LAST_ACTIVITY_KEY = "medvastr_last_act";
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes inactivity timeout

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
  if (typeof window === "undefined") return "";
  try {
    const now = Date.now();
    const lastAct = sessionStorage.getItem(LAST_ACTIVITY_KEY);
    let sid = sessionStorage.getItem(SESSION_KEY);

    if (!sid || (lastAct && now - parseInt(lastAct, 10) > SESSION_TIMEOUT_MS)) {
      sid = "s_" + Math.random().toString(36).substring(2, 11) + "_" + now;
      sessionStorage.setItem(SESSION_KEY, sid);
    }
    sessionStorage.setItem(LAST_ACTIVITY_KEY, now.toString());
    return sid;
  } catch {
    return "s_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now();
  }
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
