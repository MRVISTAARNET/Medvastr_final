"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import GenericPage from "@/components/GenericPage";
import { B } from "@/lib/data";
import { API_BASE } from "@/lib/api";

function TrackContent() {
  const searchParams = useSearchParams();
  const [orderNum, setOrderNum] = useState(searchParams.get("order") || "");
  const [tracking, setTracking] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const q = searchParams.get("order");
    if (q) {
      setOrderNum(q);
      trackOrder(q);
    }
  }, [searchParams]);

  const trackOrder = async (num?: string) => {
    const n = (num || orderNum).trim();
    if (!n) return;
    setLoading(true);
    setError("");
    setTracking(null);
    try {
      const res = await fetch(`${API_BASE}/orders/track/${encodeURIComponent(n)}`);
      const data = await res.json();
      if (data.success && data.data) {
        setTracking(data.data);
      } else {
        setError(data.message || "Order not found");
      }
    } catch {
      setError("Could not fetch tracking info");
    } finally {
      setLoading(false);
    }
  };

  return (
    <GenericPage title="Track My Order" desc="Enter your order number to track your Medvastr delivery.">
      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        <div>
          <h3 style={{ fontSize: 18, marginBottom: 16 }}>🔍 Track by Order Number</h3>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              className="price-inp"
              placeholder="e.g. MVS-2026-123456"
              style={{ flex: 1 }}
              value={orderNum}
              onChange={(e) => setOrderNum(e.target.value)}
            />
            <button className="btn-t" onClick={() => trackOrder()} disabled={loading}>
              {loading ? "…" : "Track"}
            </button>
          </div>
          {error && <p style={{ color: "#c00", marginTop: 12, fontSize: 14 }}>{error}</p>}
        </div>

        {tracking && (
          <div style={{ background: "var(--warm)", padding: 24, borderRadius: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ fontSize: 13, color: "var(--lt)" }}>Order</div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{tracking.orderNumber}</div>
              </div>
              <span className="badge b-grn" style={{ alignSelf: "flex-start" }}>{tracking.status}</span>
            </div>
            {tracking.trackingNumber && (
              <p style={{ fontSize: 14, marginBottom: 16 }}>
                AWB: <strong>{tracking.trackingNumber}</strong>
                {tracking.courierName && <> · {tracking.courierName}</>}
              </p>
            )}
            {tracking.timeline?.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {tracking.timeline.map((ev: any, i: number) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: i === 0 ? "var(--t)" : "#ccc", marginTop: 6, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{ev.status || ev.label}</div>
                      {ev.date && <div style={{ fontSize: 12, color: "var(--lt)" }}>{new Date(ev.date).toLocaleString("en-IN")}</div>}
                      {ev.description && <div style={{ fontSize: 13, color: "var(--lt)" }}>{ev.description}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div style={{ width: "100%", height: 1.5, background: "var(--bdr)" }} />
        <div style={{ background: "var(--warm)", padding: 24, borderRadius: 12, display: "flex", gap: 14 }}>
          <span style={{ fontSize: 24 }}>📞</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Need help tracking?</div>
            <div style={{ fontSize: 13, color: "var(--lt)" }}>
              Call us at <a href={`tel:${B.phone1}`} style={{ color: "var(--t)", fontWeight: 700 }}>{B.phone1}</a> (24/7)
            </div>
          </div>
        </div>
      </div>
    </GenericPage>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="page sec">Loading…</div>}>
      <TrackContent />
    </Suspense>
  );
}
