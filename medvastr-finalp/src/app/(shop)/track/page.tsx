"use client";

import GenericPage from "@/components/GenericPage";
import { B } from "@/lib/data";

export default function TrackPage() {
  return (
    <GenericPage title="Track My Order" desc="Enter your order number to track your Medvastr delivery.">
      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        <div>
          <h3 style={{ fontSize: 18, marginBottom: 16 }}>🔍 Track by Order Number</h3>
          <div style={{ display: "flex", gap: 10 }}>
            <input className="price-inp" placeholder="e.g. MVS-2026-123456" style={{ flex: 1 }} />
            <button className="btn-t">Track</button>
          </div>
        </div>
        <div style={{ width: "100%", height: 1.5, background: "var(--bdr)" }} />
        <div>
          <h3 style={{ fontSize: 18, marginBottom: 16 }}>📧 Track by Email</h3>
          <div style={{ display: "flex", gap: 10 }}>
            <input className="price-inp" placeholder="doctor@hospital.com" type="email" style={{ flex: 1 }} />
            <button className="btn-t">Find Orders</button>
          </div>
        </div>
        <div style={{ background: "var(--warm)", padding: 24, borderRadius: 12, display: "flex", gap: 14 }}>
          <span style={{ fontSize: 24 }}>📞</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Need help tracking?</div>
            <div style={{ fontSize: 13, color: "var(--lt)" }}>
              Call us at <a href={`tel:${B.phone}`} style={{ color: "var(--t)", fontWeight: 700 }}>{B.phone}</a> (24/7)
            </div>
          </div>
        </div>
      </div>
    </GenericPage>
  );
}
