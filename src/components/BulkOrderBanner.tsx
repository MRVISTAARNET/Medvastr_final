"use client";

import React, { useState, useEffect } from "react";
import { API_BASE } from "@/lib/api";

export default function BulkOrderBanner() {
  const [bg, setBg] = useState("");

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
