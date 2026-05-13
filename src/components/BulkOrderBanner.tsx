"use client";

import React from "react";
import Link from "next/link";

export default function BulkOrderBanner() {
  return (
    <div className="bulk-banner">
      <div className="bulk-in">
        <div className="bulk-content">
          <div className="bulk-tag">Special Pricing</div>
          <h2 className="bulk-h">Custom Branding & Bulk Orders</h2>
          <p className="bulk-p">
            Elevate your healthcare team's professional image with our premium scrubs and lab coats. 
            We offer custom embroidery, special volume discounts, and personalized service for clinics and hospitals.
          </p>
          <div className="bulk-btns">
            <Link href="/contact?subject=BulkOrder" className="btn-p">
              Inquire for Bulk Orders
            </Link>
            <div className="bulk-contact">
              <span>Or WhatsApp us at:</span>
              <a href="https://wa.me/919920314164" target="_blank" rel="noreferrer">+91 99203 14164</a>
            </div>
          </div>
        </div>
        <div className="bulk-badge">
          <div className="badge-ico">📦</div>
          <div className="badge-txt">15% OFF ON 10+ PCS</div>
        </div>
      </div>
    </div>
  );
}
