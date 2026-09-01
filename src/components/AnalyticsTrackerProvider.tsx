"use client";

import React, { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackAnalyticsEvent } from "@/lib/analyticsTracker";

export default function AnalyticsTrackerProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedPath = useRef<string>("");

  useEffect(() => {
    if (!pathname) return;

    const fullUrl = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");

    if (lastTrackedPath.current !== fullUrl) {
      lastTrackedPath.current = fullUrl;
      setTimeout(() => {
        trackAnalyticsEvent("PAGE_VIEW", null, fullUrl, document.title);
      }, 300);
    }
  }, [pathname, searchParams]);

  // Periodic heartbeat pulse every 30 seconds to maintain live active visitor status
  useEffect(() => {
    const timer = setInterval(() => {
      if (typeof window !== "undefined" && !document.hidden) {
        trackAnalyticsEvent("HEARTBEAT_PING");
      }
    }, 30000);

    return () => clearInterval(timer);
  }, []);

  return <>{children}</>;
}
