"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function BulkOrderBanner() {
  const src = "https://d2tnzshqdaedbc.cloudfront.net/home-bulk-banner.jpg";

  return (
    <div className="bulk-banner-sec">
      <Link href="/bulk-orders" className="bulk-banner-link">
        <div className="bulk-banner" style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer' }}>
          <Image
            src={src}
            alt="Bulk Order Program"
            fill
            style={{ objectFit: 'cover' }}
            sizes="100vw"
          />
        </div>
      </Link>
    </div>
  );
}
