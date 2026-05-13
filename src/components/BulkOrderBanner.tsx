"use client";

import React from "react";
import Link from "next/link";

export default function BulkOrderBanner() {
  return (
    <div className="bulk-banner" style={{ 
      backgroundImage: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url("/ChatGPT Image May 13, 2026, 03_34_16 PM.png")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      color: 'white'
    }}>
      <div className="bulk-in">
        <div className="bulk-content">
          <div className="bulk-tag" style={{ background: 'var(--g2)', color: 'white' }}>Special Pricing</div>
          <h2 className="bulk-h" style={{ color: 'white' }}>Custom Branding & Bulk Orders</h2>
          <p className="bulk-p" style={{ color: 'rgba(255,255,255,0.9)' }}>
            Elevate your healthcare team's professional image with our premium scrubs and lab coats. 
            We offer custom embroidery, special volume discounts, and personalized service for clinics and hospitals.
          </p>
          <div className="bulk-btns">
            <Link href="/contact?subject=BulkOrder" className="btn-p">
              Inquire for Bulk Orders
            </Link>
            <div className="bulk-contact" style={{ color: 'white' }}>
              <span>Or WhatsApp us at:</span>
              <a href="https://wa.me/919920314164" target="_blank" rel="noreferrer" style={{ color: 'white', fontWeight: 'bold' }}>+91 99203 14164</a>
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
