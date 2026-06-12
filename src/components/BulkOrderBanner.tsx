"use client";

import React, { useState } from "react";

const S3_BASE = "https://medvastr-assets.s3.ap-south-1.amazonaws.com/home-bulk-banner";
const EXTS = ['.png', '.jpg', '.jpeg'];

export default function BulkOrderBanner() {
  const [idx, setIdx] = useState(0);
  const src = idx < EXTS.length ? S3_BASE + EXTS[idx] : null;

  return (
    <div className="bulk-banner" style={src ? { backgroundImage: `url('${src}')` } : {}}>
      {src && <img src={src} alt="" style={{ display: 'none' }} onError={() => setIdx(i => i + 1)} />}
    </div>
  );
}
