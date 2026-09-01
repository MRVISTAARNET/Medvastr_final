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

    // Avoid tracking admin panel pageviews in public visitor analytics
    if (pathname.startsWith("/admin")) return;

    const fullUrl = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");

    if (lastTrackedPath.current !== fullUrl) {
      lastTrackedPath.current = fullUrl;
      // Slight timeout to let document.title render
      setTimeout(() => {
        trackAnalyticsEvent("PAGE_VIEW", null, fullUrl, document.title);
      }, 300);
    }
  }, [pathname, searchParams]);

  return <>{children}</>;
}
