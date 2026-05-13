"use client";

import React from "react";
import Link from "next/link";

export default function BulkOrderBanner() {
  return (
    <div className="bulk-banner">
      <div className="bulk-in">
        <div className="bulk-lt">
          <div className="bulk-tag">🚀 B2B & INSTITUTIONS</div>
          <h2 className="bulk-h">Outfit Your Whole Team with Medvastr</h2>
          <p className="bulk-p">
            Get exclusive pricing, custom logo embroidery, and dedicated support for hospitals, clinics, and medical colleges.
          </p>
        </div>
        <div className="bulk-rt">
          <Link href="/contact?type=bulk" className="btn-p">
            Get a Quote →
          </Link>
          <div className="bulk-meta">Minimum 10 pieces for bulk pricing</div>
        </div>
      </div>
      <style jsx>{`
        .bulk-banner {
          background: #0c1017;
          color: white;
          padding: 60px 0;
          margin: 40px 0;
          position: relative;
          overflow: hidden;
        }
        .bulk-banner::after {
          content: "⚕";
          position: absolute;
          right: -40px;
          bottom: -60px;
          font-size: 240px;
          opacity: 0.05;
          transform: rotate(-15deg);
        }
        .bulk-in {
          max-width: 1560px;
          margin: 0 auto;
          padding: 0 44px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 40px;
        }
        .bulk-tag {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 2px;
          color: var(--t2);
          margin-bottom: 12px;
        }
        .bulk-h {
          font-family: var(--serif);
          font-size: 38px;
          margin-bottom: 15px;
          line-height: 1.1;
        }
        .bulk-p {
          font-size: 16px;
          color: rgba(255,255,255,0.7);
          max-width: 500px;
        }
        .bulk-rt {
          text-align: right;
        }
        .bulk-meta {
          font-size: 12px;
          color: rgba(255,255,255,0.4);
          margin-top: 15px;
        }
        @media (max-width: 768px) {
          .bulk-in {
            flex-direction: column;
            text-align: center;
            padding: 0 20px;
          }
          .bulk-h { font-size: 28px; }
          .bulk-p { margin: 0 auto; }
          .bulk-rt { text-align: center; }
        }
      `}</style>
    </div>
  );
}
