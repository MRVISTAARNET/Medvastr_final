"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function MetaPixelRouteTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).fbq) {
      try {
        (window as any).fbq("track", "PageView");
      } catch (e) {
        /* ignore */
      }
    }
  }, [pathname, searchParams]);

  return null;
}
