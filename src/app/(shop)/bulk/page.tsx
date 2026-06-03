"use client";

import React, { useState } from "react";
import GenericPage from "@/components/GenericPage";
import { B } from "@/lib/data";
import { API_BASE } from "@/lib/api";

export default function BulkPage() {
  const [sent, setSent] = useState(false);

  return (
    <GenericPage title="Bulk Orders" desc="Special pricing for hospitals, clinics and organizations.">
      <div className="checkout-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 400px', gap: '50px' }}>
        <div className="prose">
          <p>Looking to outfit your entire team? Medvastr offers specialized bulk ordering solutions with unmatched quality and service.</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', margin: '40px 0' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#008080' }}>✓ Institutional Pricing</h3>
              <p style={{ fontSize: '14px', color: '#666' }}>Get significant tiered discounts on orders of 20 units or more. The larger the team, the better the value.</p>
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#008080' }}>✓ Custom Embroidery</h3>
              <p style={{ fontSize: '14px', color: '#666' }}>Precision branding with your hospital or clinic logo. High-thread-count embroidery that lasts the life of the garment.</p>
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#008080' }}>✓ Size & Color Variety</h3>
              <p style={{ fontSize: '14px', color: '#666' }}>Mix and match any combination of sizes (XS-3XL) and colors within your bulk order.</p>
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#008080' }}>✓ Dedicated Support</h3>
              <p style={{ fontSize: '14px', color: '#666' }}>A dedicated account manager handles everything from sizing consultations to logistics.</p>
            </div>
          </div>

          <div style={{ padding: 30, background: "#f0f9f9", borderRadius: 20, border: '1px solid #cce5e5' }}>
            <h4 style={{ margin: 0, fontSize: '16px', color: '#006060' }}>Trusted by leading institutions</h4>
            <p style={{ fontSize: '13px', color: '#666', marginTop: '10px' }}>Join the 100+ hospitals and clinics across India that trust Medvastr for their professional apparel needs.</p>
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #eee', padding: '30px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ fontSize: '50px', marginBottom: '20px' }}>📩</div>
              <h3 style={{ fontSize: '22px', fontWeight: 800 }}>Inquiry Received</h3>
              <p style={{ color: '#666' }}>Our bulk order specialist will reach out to you within 24 hours.</p>
              <button className="btn-o" onClick={() => setSent(false)} style={{ marginTop: '20px' }}>Send another</button>
            </div>
          ) : (
            <>
              <h3 style={{ marginBottom: '10px', fontSize: '20px', fontWeight: 800 }}>Inquire Now</h3>
              <p style={{ fontSize: '13px', color: '#777', marginBottom: '25px' }}>Fill out the form below and we'll send you a custom quote.</p>

              <form onSubmit={async (e) => {
                e.preventDefault();
                const form = new FormData(e.currentTarget);
                try {
                  await fetch(`${API_BASE}/inquiries`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      name: form.get("name"),
                      email: form.get("email"),
                      phone: form.get("phone"),
                      type: "BULK_ORDER",
                      message: `Org: ${form.get("org")} - Qty: ${form.get("qty")} - Desc: ${form.get("message")}`
                    })
                  });
                } catch (err) { }
                setSent(true);
              }} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input name="name" required className="price-inp" placeholder="Full Name" style={{ padding: '14px', borderRadius: '12px', border: '1.2px solid #ddd' }} />
                <input name="org" required className="price-inp" placeholder="Hospital / Organization Name" style={{ padding: '14px', borderRadius: '12px', border: '1.2px solid #ddd' }} />
                <input name="email" required type="email" className="price-inp" placeholder="Work Email" style={{ padding: '14px', borderRadius: '12px', border: '1.2px solid #ddd' }} />
                <input name="phone" required type="tel" className="price-inp" placeholder="Phone Number" style={{ padding: '14px', borderRadius: '12px', border: '1.2px solid #ddd' }} />
                <input name="qty" required type="number" className="price-inp" placeholder="Estimated Quantity (min. 20)" min="20" style={{ padding: '14px', borderRadius: '12px', border: '1.2px solid #ddd' }} />
                <textarea name="message" className="price-inp" placeholder="Additional details (colors, sizing, logos...)" style={{ padding: '14px', borderRadius: '12px', border: '1.2px solid #ddd', minHeight: '100px', fontFamily: 'inherit' }} />
                <button type="submit" className="btn-p" style={{ width: '100%', height: '54px', borderRadius: '12px', marginTop: '10px' }}>Request Bulk Quote →</button>
              </form>
            </>
          )}
        </div>
      </div>
    </GenericPage>
  );
}
