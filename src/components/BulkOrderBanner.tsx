"use client";

import React from "react";
import Link from "next/link";

export default function BulkOrderBanner() {
  const srcDesk = "https://d2tnzshqdaedbc.cloudfront.net/home-bulk-banner.jpg";
  const srcMob = "https://d2tnzshqdaedbc.cloudfront.net/home-bulk-banner-mob.jpg";

  return (
    <div className="bulk-banner-sec">
      <Link href="/bulk-orders" className="bulk-banner-link">
        <div className="bulk-banner" style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={srcDesk}
            alt="Bulk Order Program Desktop"
            className="hero-image-desktop"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={srcMob}
            alt="Bulk Order Program Mobile"
            className="hero-image-mobile"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      </Link>
    </div>
  );
}
