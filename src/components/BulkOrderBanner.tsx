"use client";

import React, { useState, useEffect } from "react";
import { API_BASE } from "@/lib/api";

export default function BulkOrderBanner() {
  const [bg, setBg] = useState("/ChatGPT Image May 13, 2026, 04_40_07 PM.png");

  useEffect(() => {
    fetch(`${API_BASE}/settings/bulk_banner`)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data) {
          setBg(d.data);
        }
      })
      .catch(() => { });
  }, []);

  return (
    <div className="bulk-banner" style={bg ? { backgroundImage: `url('${bg}')` } : {}}>
    </div>
  );
}
